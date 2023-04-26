// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract MAIChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0x3F56e0c36d275367b8C502090EDF38289b3dEa0d;

    constructor() ChainlinkOracle(0x59644ec622243878d1464A9504F9e9a31294128a) {}
}
