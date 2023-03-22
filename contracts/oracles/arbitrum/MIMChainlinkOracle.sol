// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract MIMChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A;

    constructor() ChainlinkOracle(0x87121F6c9A9F6E90E59591E4Cf4804873f54A95b) {}
}
