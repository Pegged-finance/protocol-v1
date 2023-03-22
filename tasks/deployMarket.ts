import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:Market", "Deploy market")
        .addParam("token", "Token address")
        .addParam("unitroller", "Unitroller address")
        .addParam("interestRateModel", "interestRateModel address")
        .setAction(async (taskArgs, hre) => {
                const token = await hre.ethers.getContractAt("EIP20Interface", taskArgs.token);
                const name = `Pegged Finance - ${await token.name()}`;
                const symbol = `pf.${await token.symbol()}`;

                const comptroller = await hre.ethers.getContractAt("Comptroller", taskArgs.unitroller);

                const CErc20 = await hre.ethers.getContractFactory("CErc20Immutable");
                const cErc20 = await CErc20.deploy(
                        token.address,
                        comptroller.address,
                        taskArgs.interestRateModel,
                        hre.ethers.utils.parseEther("1"),
                        name,
                        symbol,
                        18,
                        await comptroller.admin()
                )

                console.log(`${symbol} deployed, address: ${cErc20.address}`);

                await (await comptroller._supportMarket(cErc20.address)).wait();
                // await (await comptroller._setCollateralFactor(cErc20.address, hre.ethers.utils.parseEther("0.5"))).wait();
                console.log(`Comptroller 🤝 ${symbol}`)


                const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
                const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
                deployments[`${symbol}`] = cErc20.address;
                writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

                const constructorArgsFilePath = `./deployments/${hre.network.name}-constructorArgs.${symbol}.js`;
                writeFileSync(constructorArgsFilePath, `
                        module.exports = [
                                ${token.address},
                                ${comptroller.address},
                                ${taskArgs.interestRateModel},
                                ${hre.ethers.utils.parseEther("1")},
                                "${name}",
                                ${symbol},
                                18,
                                ${await comptroller.admin()}
                        ]`)

                console.log("Commands for verifications:");
                console.log(`npx hardhat --network ${hre.network.name} verify --constructor-args ${constructorArgsFilePath} ${cErc20.address}`);
                console.log("====");
                console.log("")
        })