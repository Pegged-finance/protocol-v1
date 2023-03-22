import { ContractFactory } from "ethers";


import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:Oracle", "Deploy price oracle")
    .addParam("oracleName", "Oracle contract (path or name)")
    .setAction(async (taskArgs, hre) => {
        const Oracle = await hre.ethers.getContractFactory(taskArgs.oracleName) as ContractFactory;
        const oracle = await Oracle.deploy();

        console.log(`${taskArgs.oracleName} deployed, address: ${oracle.address}`);

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));

        deployments["oracles"].push({
            name: taskArgs.oracleName,
            address: oracle.address
        });
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify ${oracle.address}`);
        console.log("====");
        console.log("")
    })