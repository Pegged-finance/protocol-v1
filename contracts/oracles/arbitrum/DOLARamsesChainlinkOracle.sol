// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {PoolAndChainlinkOracle} from "../PoolAndChainlinkOracle.sol";
import {ISolidlyPool} from "../interfaces.sol";

contract DOLARamsesChainlinkOracle is PoolAndChainlinkOracle {
    // DOLA/USDC * USDC/USD

    address public constant underlying =
        0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6;

    constructor()
        PoolAndChainlinkOracle(
            0xDd8b120DdaE0F19b922324012816F2F3Ce529BF8,
            0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3
        )
    {}

    function getPoolPrice() public view override returns (uint256) {
        uint256 price = ISolidlyPool(pool).getAmountOut(1e18, underlying);
        return scaleTo18(price, 6);
    }
}
