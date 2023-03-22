import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:CompoundLens", "Deploy CompoundLens")
    .setAction(async (taskArgs, hre) => {
        const CompoundLens = await hre.ethers.getContractFactory("CompoundLens");
        const compoundLens = await CompoundLens.deploy();
        console.log(`CompoundLens deployed, address: ${compoundLens.address}`);

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
        deployments["compoundLens"] = compoundLens.address;
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify ${compoundLens.address}`);
        console.log("====");
        console.log("")
    })