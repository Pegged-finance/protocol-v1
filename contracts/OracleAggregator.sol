// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./CErc20.sol";
import "./CToken.sol";
import "./EIP20Interface.sol";
import "./PriceOracle.sol";

import {IOracle} from "./oracles/interfaces.sol";

contract OracleAggregator is PriceOracle {
    mapping(address => address) public getOracleByUnderlying;

    constructor(address[] memory oracles) {
        for (uint256 i = 0; i < oracles.length; i++) {
            getOracleByUnderlying[IOracle(oracles[i]).underlying()] = oracles[
                i
            ];
        }
    }

    function getUnderlyingPrice(
        CToken cToken
    ) external view override returns (uint) {
        // CToken -> CErc20 needed for override PriceOracle function
        address underlying = CErc20(address(cToken)).underlying();

        address oracle = getOracleByUnderlying[underlying];
        if (oracle == address(0)) {
            // comptroller do price checks, its ok
            return 0;
        }

        uint256 underlyingDecimals = EIP20Interface(underlying).decimals();
        uint256 price = IOracle(oracle).getPrice();
        return price * (10 ** (18 - underlyingDecimals));
    }
}
