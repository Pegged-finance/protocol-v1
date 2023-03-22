// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./CErc20.sol";
import "./CToken.sol";
import "./EIP20Interface.sol";
import "./PriceOracle.sol";

contract OneUsdPriceOracle is PriceOracle {
    /**
     * @notice Get the underlying price of a cToken asset
     * @param cToken The cToken address for price retrieval
     * @return The underlying asset price mantissa (scaled by 1e18).
     *  Zero means the price is unavailable.
     */
    function getUnderlyingPrice(
        CToken cToken
    ) external view override returns (uint) {
        CErc20 cerc20 = CErc20(address(cToken)); // for override PriceOracle function
        uint256 underlyingDecimals = EIP20Interface(cerc20.underlying())
            .decimals();
        return 1e18 * (10 ** (18 - underlyingDecimals));
    }
}
