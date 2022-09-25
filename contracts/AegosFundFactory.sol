// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.4;

import "./AegosFund.sol";

contract AegosFundFactory {
  address[] public aegosFunds;

  event AegosFundCreated(address aegosFundAddress);

  function createAegosFund(
    string calldata name,
    uint requiredNbOfParticipants,
    uint recurringAmount,
    uint startDate,
    uint duration
  ) external payable {
    AegosFund aegosFund = (new AegosFund){ value: msg.value }( 
      msg.sender, name, requiredNbOfParticipants, recurringAmount, startDate, duration
    );
    address aegosFundAddress = address(aegosFund);

    aegosFunds.push(aegosFundAddress);
    emit AegosFundCreated(aegosFundAddress);
  }

  function getAegosFunds() external view returns (address[] memory) {
    return aegosFunds;
  }
}
