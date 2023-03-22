import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";

task("deploy:JumpRateModelV2", "Deploy jump rate model")
    .addParam("baseRatePerYear", "The approximate target base APR, as a mantissa (scaled by BASE)")
    .addParam("multiplierPerYear", "The rate of increase in interest rate wrt utilization (scaled by BASE)")
    .addParam("jumpMultiplierPerYear", "The multiplierPerBlock after hitting a specified utilization point")
    .addParam("kink", "The utilization point at which the jump multiplier is applied")
    .addOptionalParam("owner", "The address of the owner, which has the ability to update parameters directly")
    .setAction(async (taskArgs, hre) => {
        if (taskArgs.owner === undefined) {
            taskArgs.owner = (await hre.ethers.getSigners())[0].address
        }

        const JumpRateModelV2 = await hre.ethers.getContractFactory("JumpRateModelV2")
        const jumpRateModelV2 = await JumpRateModelV2.deploy(
            taskArgs.baseRatePerYear,
            taskArgs.multiplierPerYear,
            taskArgs.jumpMultiplierPerYear,
            taskArgs.kink,
            taskArgs.owner
        );

        console.log(`JumpRateModel deployed`);
        console.log(`Address: ${jumpRateModelV2.address}`);
        console.log("");

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
        deployments["jumpRateModelV2"] = jumpRateModelV2.address;
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify ${jumpRateModelV2.address} ${taskArgs.baseRatePerYear} ${taskArgs.multiplierPerYear} ${taskArgs.jumpMultiplierPerYear} ${taskArgs.jumpMultiplierPerYear} ${taskArgs.kink} ${taskArgs.owner}`);
    })