// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract DAIChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;

    constructor() ChainlinkOracle(0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB) {}
}
