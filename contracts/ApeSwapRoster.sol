// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A team roster management contract
/// @author DeFiFoFum
/// @notice Use this contract to create and manage "members" of a team roster.
/// @dev Once members are deactivated they cannot be reactivated. A new memberId needs to be created for reactivation.
contract ApeSwapRoster is Ownable {
    string[] public memberIds;
    uint256 public activeMembers = 0;

    struct Member {
        bool isActive;
        uint256 startDate;
        uint256 inactiveDate;
    }

    /// @notice map a memberId to Member details
    mapping(string => Member) public detailsOfMemberId;
    /// @notice map a memberId to address that has control of that member
    mapping(string => address) public adminOfMemberId;

    event AddNewMember(
        string indexed memberId,
        address indexed memberAdmin,
        uint256 startDate
    );
    event UpdateMemberAdmin(
        string indexed memberId,
        address indexed oldAdmin,
        address indexed newAdmin
    );
    event DeactivateMember(string indexed memberId, uint256 inactiveDate);

    /// @notice Check if memberId passed has been created
    /// @param memberId The string representation of the memberId
    modifier isValidMemberId(string memory memberId) {
        require(
            detailsOfMemberId[memberId].startDate > 0,
            "please provide a valid member id"
        );
        _;
    }

    /// @notice Check if an address is the admin of a Member
    /// @param memberId The string representation of the memberId
    /// @param checkAddress Address to check against memberId
    /// @return bool
    function isAdminForMember(string memory memberId, address checkAddress)
        public
        view
        isValidMemberId(memberId)
        returns (bool)
    {
        return adminOfMemberId[memberId] == checkAddress;
    }

    /// @notice Check if a memberId is still an active member of the roster
    /// @dev inactiveDate will return 0 if member is still active
    /// @param memberId The string representation of the memberId
    /// @return isActive boolean
    /// @return inactiveDate timestamp of when user became inactive
    function isActiveMember(string memory memberId)
        public
        view
        isValidMemberId(memberId)
        returns (bool isActive, uint256 inactiveDate)
    {
        isActive = detailsOfMemberId[memberId].isActive;
        inactiveDate = detailsOfMemberId[memberId].inactiveDate;
    }

    /// @notice Get the number of memberIds created
    /// @return number of memberIds
    function getMemberIdsLength() public view returns (uint256) {
        return memberIds.length;
    }

    /// @notice External contracts can use this helper function to estimate pro rata payments
    /// @param memberId The string representation of the memberId
    /// @param from The starting timestamp
    /// @param to The ending timestamp
    /// @return number of active seconds between from and to
    function getActiveSecondsForMember(
        string memory memberId,
        uint256 from,
        uint256 to
    ) external view isValidMemberId(memberId) returns (uint256) {
        Member memory member = detailsOfMemberId[memberId];
        // chose the later from date
        uint256 actualFrom = member.startDate > from ? member.startDate : from;
        // chose the earlier to date
        uint256 actualTo = block.timestamp < to ? block.timestamp : to;
        if (member.isActive == false) {
            // If member is inactive then adjust using the inactiveDate
            actualTo = member.inactiveDate < actualTo
                ? member.inactiveDate
                : actualTo;
        }
        
        if (actualFrom > actualTo) {
            return 0;
        }
        return actualTo - actualFrom;
    }

    /// @notice Allows a member admin to change the admin of their member
    /// @dev This function can also be called by the owner of the roster
    /// @param memberId The string representation of the memberId
    /// @param newAdminOfMember New address to set as member admin
    function setMemberAdmin(string memory memberId, address newAdminOfMember)
        external
        isValidMemberId(memberId)
    {
        require(
            adminOfMemberId[memberId] == msg.sender || msg.sender == owner(),
            "only callable by member admin or owner"
        );
        adminOfMemberId[memberId] = newAdminOfMember;
        emit UpdateMemberAdmin(memberId, msg.sender, newAdminOfMember);
    }

    /// @notice Create a new memberId for the roster.
    /// @param memberId The string representation of the memberId
    /// @param memberAdmin The admin address of the member
    function addMember(string memory memberId, address memberAdmin)
        external
        onlyOwner
    {
        require(
            detailsOfMemberId[memberId].startDate == 0,
            "member id already exists"
        );
        memberIds.push(memberId);
        adminOfMemberId[memberId] = memberAdmin;
        detailsOfMemberId[memberId] = Member(true, block.timestamp, 0);
        activeMembers++;
        emit AddNewMember(memberId, memberAdmin, block.timestamp);
    }

    /// @notice Deactivate a member by owner (One way operation!)
    /// @dev When a member is deactivated, their inactiveDate is set to the current timestamp
    /// @param memberId The string representation of the memberId
    function deactivateMember(string memory memberId)
        external
        onlyOwner
        isValidMemberId(memberId)
    {
        Member storage member = detailsOfMemberId[memberId];
        require(member.isActive, "member is already deactivated");
        member.inactiveDate = block.timestamp;
        member.isActive = false;
        activeMembers--;
        emit DeactivateMember(memberId, block.timestamp);
    }
}
