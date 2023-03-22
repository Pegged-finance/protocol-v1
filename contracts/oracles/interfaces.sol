// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

interface IOracle {
    // returns price with 18 decimals, eg 1$ = 1000000000000000000
    function getPrice() external view returns (uint256);

    function underlying() external view returns (address);
}

interface IAggregatorV3 {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

interface ICurvePool {
    function get_dy(
        int128 i,
        int128 j,
        uint256 dx
    ) external view returns (uint256);
}

interface ISolidlyPool {
    function getAmountOut(
        uint amountIn,
        address tokenIn
    ) external view returns (uint256);
}
