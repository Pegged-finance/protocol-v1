pragma solidity ^0.8.10;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Peg is ERC20 {
    constructor(uint256 initalSuply) ERC20("Pegged Finance", "PEG") {
        _mint(msg.sender, initalSuply);
    }
}
