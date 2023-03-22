// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract USDCChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;

    constructor() ChainlinkOracle(0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3) {}
}
