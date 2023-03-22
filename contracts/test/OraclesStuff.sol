// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {PoolAndChainlinkOracle} from "../oracles/PoolAndChainlinkOracle.sol";

contract TestPool {
    uint256 public price = 1e18;

    function setPrice(uint256 newPrice) external {
        price = newPrice;
    }
}

contract TestChainlink {
    uint8 public decimals = 27;
    int256 chainlinkAnswer = 1e18;

    function setDecimals(uint8 newDecimals) external {
        decimals = newDecimals;
    }

    function setAnswer(int256 newAnswer) external {
        chainlinkAnswer = newAnswer;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        answer = chainlinkAnswer;
    }
}

contract TestPoolAndChainlinkOracle is PoolAndChainlinkOracle {
    address public constant underlying = address(123);

    constructor(
        address pool_,
        address chainlinkFeed_
    ) PoolAndChainlinkOracle(pool_, chainlinkFeed_) {}

    function getPoolPrice() public view override returns (uint256 price) {
        price = TestPool(pool).price();
    }
}
