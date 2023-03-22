// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import {PoolAndChainlinkOracle} from "../PoolAndChainlinkOracle.sol";
import {ICurvePool} from "../interfaces.sol";

contract VSTCurveChainlinkOracle is PoolAndChainlinkOracle {
    // VST/FRAX * FRAX/USD

    address public constant underlying =
        0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17;

    constructor()
        PoolAndChainlinkOracle(
            0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4,
            0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8
        )
    {}

    function getPoolPrice() public view override returns (uint256 price) {
        price = ICurvePool(pool).get_dy(0, 1, 1e18);
    }
}
