import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PoolAndChainlinkOracle", function () {
    async function poolAndChainlinkOracleFixture() {
        const [owner, keeper, otherAccount] = await ethers.getSigners();

        const TestPool = await ethers.getContractFactory("TestPool");
        const testPool = await TestPool.deploy();

        const TestChainlink = await ethers.getContractFactory("TestChainlink");
        const testChainlink = await TestChainlink.deploy();

        const TestPoolAndChainlinkOracle = await ethers.getContractFactory("TestPoolAndChainlinkOracle");
        const poolAndChainlinkOracle = await TestPoolAndChainlinkOracle.deploy(testPool.address, testChainlink.address)

        return { poolAndChainlinkOracle, owner, keeper, otherAccount, testPool, testChainlink };
    }

    describe("Deploy", function () {
        it("Shoud set pool and chainlink after deploy", async function () {
            const { poolAndChainlinkOracle, owner, testPool, testChainlink } = await loadFixture(poolAndChainlinkOracleFixture);

            expect(await poolAndChainlinkOracle.owner()).to.eq(owner.address);
            expect(await poolAndChainlinkOracle.keeper()).to.eq(owner.address);
            expect(await poolAndChainlinkOracle.chainlink()).to.eq(testChainlink.address);
            expect(await poolAndChainlinkOracle.pool()).to.eq(testPool.address);
        });

        it("Shoud set owner and keeper as msg.sender ", async function () {
            const { poolAndChainlinkOracle, owner } = await loadFixture(poolAndChainlinkOracleFixture);

            expect(await poolAndChainlinkOracle.owner()).to.eq(owner.address);
            expect(await poolAndChainlinkOracle.keeper()).to.eq(owner.address);
        });
    });

    describe("ACL", function () {
        it("Only owner could change params", async function () {
            const { poolAndChainlinkOracle, owner, keeper, otherAccount } = await loadFixture(poolAndChainlinkOracleFixture);

            await poolAndChainlinkOracle.connect(owner).setKeeper(keeper.address);

            await expect(poolAndChainlinkOracle.connect(owner).setKeeper(poolAndChainlinkOracle.address)).to.be.not.reverted;
            await expect(poolAndChainlinkOracle.connect(keeper).setKeeper(poolAndChainlinkOracle.address)).to.be.reverted;
            await expect(poolAndChainlinkOracle.connect(otherAccount).setKeeper(poolAndChainlinkOracle.address)).to.be.reverted;

            await expect(poolAndChainlinkOracle.connect(owner).setPriceChangeThreshold(10)).to.be.not.reverted;
            await expect(poolAndChainlinkOracle.connect(keeper).setPriceChangeThreshold(10)).to.be.reverted;
            await expect(poolAndChainlinkOracle.connect(otherAccount).setPriceChangeThreshold(10)).to.be.reverted;

        });

        it("Only keeper can perform update ", async function () {
            const { poolAndChainlinkOracle, owner, keeper, otherAccount } = await loadFixture(poolAndChainlinkOracleFixture);

            await poolAndChainlinkOracle.connect(owner).setKeeper(keeper.address);

            await expect(poolAndChainlinkOracle.connect(owner).setPrice(123)).to.be.reverted;
            await expect(poolAndChainlinkOracle.connect(keeper).setPrice(123)).to.be.not.reverted;
            await expect(poolAndChainlinkOracle.connect(otherAccount).setPrice(123)).to.be.reverted;

            const [, performData] = await poolAndChainlinkOracle.checkUpkeep([]);
            await expect(poolAndChainlinkOracle.connect(owner).performUpkeep(performData)).to.be.reverted;
            await expect(poolAndChainlinkOracle.connect(keeper).performUpkeep(performData)).to.be.not.reverted;
            await expect(poolAndChainlinkOracle.connect(otherAccount).performUpkeep(performData)).to.be.reverted;
        });
    });

    describe("Updates", function () {
        it("Should return upkeepNeeded = true, when price changed significantly", async function () {
            const { poolAndChainlinkOracle, testPool } = await loadFixture(poolAndChainlinkOracleFixture);

            let price = ethers.utils.parseEther("1");
            await poolAndChainlinkOracle.setPrice(price);

            price = price.mul(2);
            await testPool.setPrice(price)

            let [upkeepNeeded] = await poolAndChainlinkOracle.checkUpkeep([]);
            expect(upkeepNeeded).to.be.true;

            // price changed for 1 bps
            price = price.add(price.div(10000))
            await poolAndChainlinkOracle.setPriceChangeThreshold(2)
            await poolAndChainlinkOracle.setPrice(price)

            upkeepNeeded = (await poolAndChainlinkOracle.checkUpkeep([]))[0];
            expect(upkeepNeeded).to.be.false;
        })
    });

    describe("Price", function () {
        it("It should take price (saved) from pool and multiply it by chainlink", async function () {
            const { poolAndChainlinkOracle, testPool, testChainlink } = await loadFixture(poolAndChainlinkOracleFixture);

            const poolPrice = ethers.utils.parseEther("1.01");
            await testPool.setPrice(poolPrice);

            const chainlinkPrice = ethers.utils.parseUnits("0.998", 9);
            await testChainlink.setAnswer(chainlinkPrice);
            await testChainlink.setDecimals(9);

            const [, upkeepData] = await poolAndChainlinkOracle.checkUpkeep([]);
            await poolAndChainlinkOracle.performUpkeep(upkeepData);

            const price = poolPrice.mul(chainlinkPrice).div(ethers.utils.parseUnits("1", 9))
            expect(await poolAndChainlinkOracle.getPrice()).to.be.eq(price)
        })

        it("It should correct handle chainlink decimals", async function () {
            const { poolAndChainlinkOracle, testPool, testChainlink } = await loadFixture(poolAndChainlinkOracleFixture);

            const poolPrice = ethers.utils.parseEther("1.01");
            await testPool.setPrice(poolPrice);

            const chainlinkPrice = ethers.utils.parseUnits("0.998", 27);
            await testChainlink.setAnswer(chainlinkPrice);
            await testChainlink.setDecimals(27);

            const [, upkeepData] = await poolAndChainlinkOracle.checkUpkeep([]);
            await poolAndChainlinkOracle.performUpkeep(upkeepData);

            const price = poolPrice.mul(chainlinkPrice).div(ethers.utils.parseUnits("1", 27))
            expect(await poolAndChainlinkOracle.getPrice()).to.be.eq(price)
        })

    });


})