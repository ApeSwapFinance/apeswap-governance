// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MessageBoard is Ownable {
    string[] public messages;

    event MessageAddded(
        address indexed from,
        string indexed message
    );

    function getMessagesLength() public view returns (uint) {
        return messages.length;
    }

    function getLatestMessage() external view returns (string memory) {
        if(getMessagesLength() > 0) {
            return messages[getMessagesLength() - 1];
        }
        return "";
    }

    function addMessage(string memory message)
        external
        onlyOwner
    {
        messages.push(message);
        emit MessageAddded(msg.sender, message);
    }
}
