// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {PoolAndChainlinkOracle} from "../PoolAndChainlinkOracle.sol";
import {ISolidlyPool} from "../interfaces.sol";

contract LUSDCamelotChainlinkOracle is PoolAndChainlinkOracle {
    // LUSD/WETH * WETH/USD

    address public constant underlying =
        0x93b346b6BC2548dA6A1E7d98E9a421B42541425b;

    constructor()
        PoolAndChainlinkOracle(
            0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4,
            0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8
        )
    {}

    function getPoolPrice() public view override returns (uint256 price) {
        price = ISolidlyPool(pool).getAmountOut(1e18, underlying);
    }
}
