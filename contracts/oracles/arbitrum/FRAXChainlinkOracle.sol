// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {ChainlinkOracle} from "../ChainlinkOracle.sol";

contract FRAXChainlinkOracle is ChainlinkOracle {
    address public constant underlying =
        0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F;

    constructor() ChainlinkOracle(0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8) {}
}
