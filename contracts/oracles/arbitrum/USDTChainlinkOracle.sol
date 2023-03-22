// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract USDTChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;

    constructor() ChainlinkOracle(0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7) {}
}
