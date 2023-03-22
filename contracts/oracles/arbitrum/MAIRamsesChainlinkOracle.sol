// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {PoolAndChainlinkOracle} from "../PoolAndChainlinkOracle.sol";
import {ISolidlyPool} from "../interfaces.sol";

contract MAIRamsesChainlinkOracle is PoolAndChainlinkOracle {
    // MAI/USDC * USDC/USD

    address public constant underlying =
        0x3F56e0c36d275367b8C502090EDF38289b3dEa0d;

    constructor()
        PoolAndChainlinkOracle(
            0x3c6eF5Ed8ad5DF0d5e3D05C6e607c60F987fB735,
            0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3
        )
    {}

    function getPoolPrice() public view override returns (uint256) {
        uint256 price = ISolidlyPool(pool).getAmountOut(1e18, underlying);
        return scaleTo18(price, 6);
    }
}
