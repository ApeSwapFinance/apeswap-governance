// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeSwapRoster is Ownable {
    string[] public memberIds;
    uint public activeMembers = 0;

    struct Member {
        bool isActive;
        uint startDate;
        uint inactiveDate;
    } 

    mapping(string => Member) public detailsOfMemberId;
    mapping(string => address) public adminOfMemberId;

    event AddNewMember(string indexed memberId, address indexed memberAdmin, uint startDate);
    event UpdateMemberAdmin(string indexed memberId, address indexed oldAdmin, address indexed newAdmin);
    event DeactivateMember(string indexed memberId, uint inactiveDate);

    modifier isValidMemberId(string memory memberId) {
        require(detailsOfMemberId[memberId].startDate > 0, "please provide a valid member id");
        _;
    }

    function isAdminForMember(string memory memberId, address checkAddress) public view isValidMemberId(memberId) returns (bool) {
        return adminOfMemberId[memberId] == checkAddress;
    }

    function isActiveMember(string memory memberId) public view isValidMemberId(memberId) returns (bool isActive, uint inactiveDate) {
        isActive = detailsOfMemberId[memberId].isActive;
        inactiveDate = detailsOfMemberId[memberId].inactiveDate;
    }

    function getMemberIdsLength() public view returns (uint) {
        return memberIds.length;
    }

    function getActiveSecondsForMember(string memory memberId, uint from, uint to) public view isValidMemberId(memberId) returns (uint) {
        Member memory member = detailsOfMemberId[memberId];
        uint actualFrom = member.startDate > from ? member.startDate : from;
        uint actualTo = block.timestamp < to ? block.timestamp : to;
        if(member.isActive == false) {
            actualTo = member.inactiveDate < actualTo ? member.inactiveDate : actualTo;
        }

        if(actualFrom > actualTo) {
            return 0;
        }
        return actualTo - actualFrom;
    }


    function addMember(string memory memberId, address memberAdmin) external onlyOwner {
        require(detailsOfMemberId[memberId].startDate == 0, "member id already exists");
        memberIds.push(memberId);
        adminOfMemberId[memberId] = memberAdmin;
        detailsOfMemberId[memberId] = Member(true, block.timestamp, 0);
        activeMembers++;
        emit AddNewMember(memberId, memberAdmin, block.timestamp);
    }

    function setMemberAdmin(string memory memberId, address newAdminOfMember) external isValidMemberId(memberId) {
        require(adminOfMemberId[memberId] == msg.sender || msg.sender == owner(), "only callable by member admin or owner");
        adminOfMemberId[memberId] = newAdminOfMember;
        emit UpdateMemberAdmin(memberId, msg.sender, newAdminOfMember);
    }

    function deactivateMember(string memory memberId) external onlyOwner isValidMemberId(memberId) {
        Member storage member = detailsOfMemberId[memberId];
        require(member.isActive, "member is already deactivated");
        member.inactiveDate = block.timestamp;
        member.isActive = false;
        activeMembers--;
        emit DeactivateMember(memberId, block.timestamp);
    }
}
