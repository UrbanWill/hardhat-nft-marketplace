// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import { EIP712MetaTransaction } from "./base/EIP712/EIP712MetaTransaction.sol";

/*
 * @notice This is a temporary contract to test the EIP712MetaTransaction contract
 */
contract SetQuote is EIP712MetaTransaction("TestContract", "1") {
    string public quote;
    address public owner;

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    function getQuote() public view returns (string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
