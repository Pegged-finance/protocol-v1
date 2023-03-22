// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import {BaseUsdPeggedOracle} from "./BaseUsdPeggedOracle.sol";
import {IAggregatorV3} from "./interfaces.sol";

abstract contract PoolAndChainlinkOracle is BaseUsdPeggedOracle, Ownable {
    // Oracle for STABLE -> USD
    // We take price from some pool and multiply it by chainlink price

    // For example
    // STABLE/WETH * WETH/USD -> STABLE/USD

    // We use this oracle, when we can't take price from pool
    // because of possible flash loan + big swap manipulation

    // NB: contract have compatible interface with Chainlink Automation

    IAggregatorV3 public immutable chainlink;
    address public immutable pool;

    address public keeper;

    uint256 public updatedAt;
    uint256 public poolPrice;
    uint256 public priceChangeThreshold = 10; // 10 bps -> 0.1%

    event KeeperChanged(address oldKeeper, address newKeeper);
    event PriceChanged(uint256 oldPrice, uint256 newPrice);
    event PriceChangeThresholdChanged(
        uint256 oldPriceChangeThreshold,
        uint256 newPriceChangeThreshold
    );

    constructor(address pool_, address chainlinkFeed_) {
        pool = pool_;
        chainlink = IAggregatorV3(chainlinkFeed_);

        setKeeper(msg.sender);
    }

    //
    // write functions

    function setKeeper(address newKeeper) public onlyOwner {
        // event emitted before action, becasue we wan't create unnecessary variable
        emit KeeperChanged(keeper, newKeeper);

        keeper = newKeeper;
    }

    function setPrice(uint256 newPoolPrice) public onlyKeeper {
        // event emitted before action, becasue we wan't create unnecessary variable
        emit PriceChanged(poolPrice, newPoolPrice);

        updatedAt = block.timestamp;
        poolPrice = newPoolPrice;
    }

    function setPriceChangeThreshold(
        uint256 newPriceChangeThreshold
    ) external onlyOwner {
        require(newPriceChangeThreshold > 0);

        // event emitted before action, becasue we wan't create unnecessary variable
        emit PriceChangeThresholdChanged(
            priceChangeThreshold,
            newPriceChangeThreshold
        );

        priceChangeThreshold = newPriceChangeThreshold;
    }

    function performUpkeep(bytes calldata performData) external {
        // no access modifiers, because check performs in `setPrice` function
        uint256 newPoolPrice = abi.decode(performData, (uint256));
        setPrice(newPoolPrice);
    }

    //
    // view functions

    function checkUpkeep(
        bytes calldata
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 newPoolPrice = getPoolPrice();
        uint256 absDelta = newPoolPrice > poolPrice
            ? newPoolPrice - poolPrice
            : poolPrice - newPoolPrice;

        upkeepNeeded = absDelta >= (poolPrice * priceChangeThreshold) / 10_000;
        performData = abi.encode(newPoolPrice);
    }

    function getPoolPrice() public view virtual returns (uint256 price);

    function _getPrice() internal view override returns (uint256) {
        (, int256 chainlinkRawPrice, , , ) = chainlink.latestRoundData();
        if (chainlinkRawPrice < 0) return 0;
        uint256 chainlinkPrice = scaleTo18(
            uint256(chainlinkRawPrice),
            chainlink.decimals()
        );

        return (poolPrice * chainlinkPrice) / 1e18;
    }

    //
    // modifiers

    modifier onlyKeeper() {
        require(keeper == _msgSender());
        _;
    }
}
