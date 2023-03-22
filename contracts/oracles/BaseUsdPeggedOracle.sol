// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {IOracle} from "./interfaces.sol";

abstract contract BaseUsdPeggedOracle is IOracle {
    function getPrice() external view returns (uint256 price) {
        price = _getPrice();

        require(price > 10000000000000000, "Broken decimals"); // // price should be more then 0.01$
        require(price < 1200000000000000000, "Positive depeg"); // price should be less then 1.2$
    }

    function _getPrice() internal view virtual returns (uint256);

    function scaleTo18(
        uint256 value,
        uint256 valueDecimals
    ) public pure returns (uint256) {
        if (valueDecimals <= 18) {
            return value * (10 ** (18 - valueDecimals));
        } else {
            return value / (10 ** (valueDecimals - 18));
        }
    }
}
