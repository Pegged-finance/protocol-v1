import { expect } from "chai";
import { ethers, network } from "hardhat";
import { PeggedFinanceLge } from "../typechain-types";
import { Signer } from "ethers";


const TEST_BLOCK = 86140426; // (May-01-2023 09:13:18 AM +UTC)
const DEPLOYER = "0x6513B19f08881400f180Cba0aA175627E99e4AA5";


describe("Pegged Finance LGE", function () {
    beforeEach(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    jsonRpcUrl: process.env.ARBITRUM_RPC!,
                    blockNumber: TEST_BLOCK
                }
            }],
        });

    });

    async function setupLGE() {
        const [buyer1, buyer2] = await ethers.getSigners();
        const deployer = await ethers.getImpersonatedSigner(DEPLOYER);

        const LGE = await ethers.getContractFactory("PeggedFinanceLge");
        const lge = await LGE.connect(deployer).deploy();

        const PEGG = await ethers.getContractAt("IERC20", await lge.PEGG());
        await PEGG.connect(deployer).transfer(lge.address, (await lge.PEGG_AMOUNT_FOR_LGE()).mul(2));

        return { deployer, lge, PEGG, buyer1, buyer2 };
    }

    async function getWETH() {
        return await ethers.getContractAt("IWETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1");
    }

    async function start(lge: PeggedFinanceLge) {
        await network.provider.send("evm_increaseTime", [(await lge.timeBeforeLgeStart()).toNumber()]);
        await network.provider.send("evm_mine");
    }

    async function buy(
        lge: PeggedFinanceLge,
        buyer: Signer | undefined = undefined,
        useWeth = false,
        amount = ethers.utils.parseEther("1"),
        referrer = ethers.constants.AddressZero
    ) {
        if (buyer === undefined) {
            [buyer] = await ethers.getSigners()
        }

        if (useWeth) {
            const WETH = await getWETH();
            await WETH.connect(buyer).deposit({ value: amount })
            await WETH.connect(buyer).approve(lge.address, amount);
            return await lge.connect(buyer).buyWETH(amount, referrer);
        } else {
            return await lge.connect(buyer).buyETH(referrer, { value: amount });
        }
    }

    async function stop(lge: PeggedFinanceLge) {
        await network.provider.send("evm_increaseTime", [(await lge.timeBeforeLgeEnd()).toNumber()]);
        await network.provider.send("evm_mine");
    }

    async function cliff(lge: PeggedFinanceLge) {
        await network.provider.send("evm_increaseTime", [
            (await lge.TIME_BEFORE_CLIFF()).toNumber()
        ]);
        await network.provider.send("evm_mine");
    }

    async function fullUnlock(lge: PeggedFinanceLge) {
        await network.provider.send("evm_increaseTime", [
            (await lge.MAX_LAST_BUY_TIMEDELTA())
                .add(await lge.TIME_BEFORE_CLIFF())
                .add(await lge.TIME_FOR_LINEAR_UNLOCK())
                .toNumber()
        ]);
        await network.provider.send("evm_mine");
    }

    describe("timeBeforeLgeStart", function () {
        it("Should return >0 if LGE not started", async function () {
            const { lge } = await setupLGE();

            expect(await lge.timeBeforeLgeStart()).to.be.gt(0);
        })

        it("Should return 0 when LGE started", async function () {
            const { lge } = await setupLGE();
            await start(lge);

            expect(await lge.timeBeforeLgeStart()).to.be.eq(0);
        })
    });

    describe("timeBeforeIdoEnd", function () {
        it("Should return true time before LGE end", async function () {
            const { lge, buyer1 } = await setupLGE();
            await start(lge);
            await buy(lge, buyer1);

            expect(await lge.timeBeforeLgeEnd()).to.be.gt(0);
        })

        it("Should return 0 when LGE ended", async function () {
            const { lge, buyer1 } = await setupLGE();
            await start(lge);
            await buy(lge, buyer1);
            await stop(lge);

            expect(await lge.timeBeforeLgeEnd()).to.be.eq(0);
        })
    });

    describe("Buy", function () {
        it("Should revert if lge not started", async function () {
            const { lge, buyer1 } = await setupLGE();

            await expect(buy(lge, buyer1)).revertedWith("LGE not started");
        })

        it("Should normally buy with ETH", async function () {
            const { lge, buyer1 } = await setupLGE();
            await start(lge);

            await expect(buy(lge, buyer1)).not.reverted;
        })

        it("Should normally buy with WETH", async function () {
            const { lge, buyer1 } = await setupLGE();
            await start(lge);

            await expect(buy(lge, buyer1, true)).not.reverted;
        })

        describe("Common buy logic", function () {
            it("Shoud store WETH on balance", async function () {
                const { lge, buyer1 } = await setupLGE();
                const WETH = await getWETH();
                const amount = ethers.utils.parseEther("1");

                await start(lge);
                await buy(lge, buyer1, false, amount);

                expect(await WETH.balanceOf(lge.address)).to.be.eq(amount);
            })

            it("Shoud mints LGE tokens with bonus (for step1)", async function () {
                const { lge, buyer1 } = await setupLGE();
                const amount = ethers.utils.parseEther("1");
                const bonus = (await lge.STEP1_BONUS()).toNumber();

                await start(lge);
                await buy(lge, buyer1, false, amount);

                expect(await lge.balanceOf(buyer1.address)).to.be.eq(amount.mul(100 + bonus).div(100));
            })

            it("Shoud mints LGE tokens with bonus (for step2)", async function () {
                const { lge, buyer1, buyer2 } = await setupLGE();
                const amount = ethers.utils.parseEther("1");
                const bonus = (await lge.STEP2_BONUS()).toNumber();

                await start(lge);
                await buy(lge, buyer1, false, await lge.STEP1_AMOUNT());
                await buy(lge, buyer2, false, amount);

                expect(await lge.balanceOf(buyer2.address)).to.be.eq(amount.mul(100 + bonus).div(100));
            })

            it("Shoud mints LGE tokens with referral bonus", async function () {
                const { lge, buyer1, buyer2 } = await setupLGE();
                const amount = ethers.utils.parseEther("1");
                const bonus = (await lge.REFERRAL_LGE_BONUS()).toNumber();

                await start(lge);
                await buy(lge, buyer1, false, (await lge.STEP1_AMOUNT()).add(await lge.STEP2_AMOUNT()));
                await buy(lge, buyer2, false, amount, lge.address);

                expect(await lge.balanceOf(buyer2.address)).to.be.eq(amount.mul(100 + bonus).div(100));
            })

            it("Shoud mints LGE tokens without bonus (after step2)", async function () {
                const { lge, buyer1, buyer2 } = await setupLGE();
                const amount = ethers.utils.parseEther("1");

                await start(lge);
                await buy(lge, buyer1, false, (await lge.STEP1_AMOUNT()).add(await lge.STEP2_AMOUNT()));
                await buy(lge, buyer2, false, amount);

                expect(await lge.balanceOf(buyer2.address)).to.be.eq(amount);
            })

            it("Shoud update referral bonus", async function () {
                const { lge, buyer1 } = await setupLGE();
                const amount = ethers.utils.parseEther("1");
                const referralCode = lge.address;

                await start(lge);
                await buy(lge, buyer1, false, amount, referralCode);

                expect(await lge.balanceOf(lge.address)).to.be.gt(0);
            })
        })
    })

    describe("After LGE", function () {
        it("Shoud provide liquidity to pool", async function () {
            const { lge, buyer1, deployer } = await setupLGE();
            const pair = await ethers.getContractAt("IERC20", await lge.PAIR());

            await start(lge);
            await buy(lge, buyer1, false, ethers.utils.parseEther("100"));
            await stop(lge);

            await lge.connect(deployer).provideLiquidity();
            expect(await pair.balanceOf(lge.address)).to.be.gt(0);
        })
        it("Should return PEGG for user after unlock and burn all lge tokens", async function () {
            const { lge, buyer1, deployer, PEGG } = await setupLGE();

            await start(lge);
            await buy(lge, buyer1, false, ethers.utils.parseEther("100"));
            await stop(lge);
            await lge.connect(deployer).provideLiquidity();
            await fullUnlock(lge);

            await lge.connect(buyer1).claimPEGG(0);
            expect(await PEGG.balanceOf(buyer1.address)).to.be.gt(0);
            expect(await lge.balanceOf(buyer1.address)).to.be.eq(0);

        })
        it("Should burn correct share for user", async function () {
            const { lge, buyer1, buyer2, deployer, PEGG } = await setupLGE();
            const pair = await ethers.getContractAt("IERC20", await lge.PAIR());

            await start(lge);
            await buy(lge, buyer1, false, ethers.utils.parseEther("100")); // 120 user, 80 protocol
            await buy(lge, buyer2, false, ethers.utils.parseEther("80")); // 80 user, 80 protocol
            await stop(lge);
            await lge.connect(deployer).provideLiquidity();
            await fullUnlock(lge);

            const lpAmountBefore = await pair.balanceOf(lge.address);
            const lgeAmountBefore = await lge.totalSupply();

            await lge.connect(buyer1).claimPEGG(0);

            const lpAmountAfter = await pair.balanceOf(lge.address);
            const lgeAmountAfter = await lge.totalSupply();

            expect(lpAmountBefore.sub(lpAmountAfter).mul(100).div(lpAmountBefore)).to.be.eq(lgeAmountBefore.sub(lgeAmountAfter).mul(100).div(lgeAmountBefore));
        })

        describe("Unlock schedule", async function () {
            it("Should unlock 50% tokens after cliff", async function () {
                const { lge, buyer1, buyer2, deployer } = await setupLGE();
                const amount = ethers.utils.parseEther("100")

                await start(lge);
                await buy(lge, buyer1, false, ethers.utils.parseEther("100")); // skip bonuses
                await buy(lge, buyer2, false, amount);
                await stop(lge);
                await lge.connect(deployer).provideLiquidity();
                await cliff(lge);

                expect(await lge.unlockedAmount(buyer2.address)).to.be.eq(amount.div(2));
            })
        })
    })
    describe("Service functions", async function () {
        it("Should rescue tokens", async function () {
            const { lge, buyer1, deployer, PEGG } = await setupLGE();

            await start(lge);
            await buy(lge, buyer1, false, ethers.utils.parseEther("1"));
            await stop(lge);
            await lge.connect(deployer).provideLiquidity();

            await expect(lge.connect(deployer).rescueTokens(PEGG.address)).to.be.not.reverted;
            await expect(lge.connect(deployer).rescueTokens(await lge.PAIR())).to.be.not.reverted;
            await expect(lge.connect(deployer).rescueTokens(await lge.WETH())).to.be.not.reverted;
        })
    })

});