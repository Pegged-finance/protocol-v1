// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract USDCChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0x7F5c764cBc14f9669B88837ca1490cCa17c31607;

    constructor() ChainlinkOracle(0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3) {}
}
