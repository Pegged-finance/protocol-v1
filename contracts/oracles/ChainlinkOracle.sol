// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {BaseUsdPeggedOracle} from "./BaseUsdPeggedOracle.sol";
import {IAggregatorV3} from "./interfaces.sol";

abstract contract ChainlinkOracle is BaseUsdPeggedOracle {
    IAggregatorV3 public immutable chainlink;

    constructor(address chainlinkFeed_) {
        chainlink = IAggregatorV3(chainlinkFeed_);
    }

    function _getPrice() internal view override returns (uint256) {
        (, int256 chainlinkRawPrice, , , ) = chainlink.latestRoundData();
        if (chainlinkRawPrice < 0) return 0;
        return scaleTo18(uint256(chainlinkRawPrice), chainlink.decimals());
    }
}
