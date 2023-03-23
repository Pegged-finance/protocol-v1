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

                const Delegate = await hre.ethers.getContractFactory("CErc20Delegate");
                const delegate = await Delegate.deploy()

                const Delegator = await hre.ethers.getContractFactory("CErc20Delegator");
                const delegator = await Delegator.deploy(
                        token.address,
                        comptroller.address,
                        taskArgs.interestRateModel,
                        hre.ethers.utils.parseEther("1"),
                        name,
                        symbol,
                        18,
                        await comptroller.admin(),
                        delegate.address,
                        []
                )
                console.log(`${symbol} deployed, address: ${delegator.address}`);

                await (await comptroller._supportMarket(delegator.address)).wait();
                console.log(`Comptroller 🤝 ${symbol}`)


                const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
                const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
                deployments[`${symbol}`] = delegator.address;
                deployments[`${symbol}-implementation`] = delegate.address;
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
                                ${await comptroller.admin()},
                                ${delegate.address},
                                []
                        ]`)

                console.log("Commands for verifications:");
                console.log(`npx hardhat --network ${hre.network.name} verify ${delegate.address}`);
                console.log(`npx hardhat --network ${hre.network.name} verify --constructor-args ${constructorArgsFilePath} ${delegator.address}`);
                console.log("====");
                console.log("")
        })