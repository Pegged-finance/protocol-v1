import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";

task("deploy:Unitroller", "Deploy unitroller").setAction(async (taskArgs, hre) => {
    const Unitroller = await hre.ethers.getContractFactory("Unitroller");
    const unitroller = await Unitroller.deploy();
    console.log(`Unitroller deployed, address: ${unitroller.address}`);

    const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
    const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
    deployments["unitroller"] = unitroller.address;
    writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

    console.log("Commands for verifications:");
    console.log(`npx hardhat --network ${hre.network.name} verify ${unitroller.address}`);
    console.log("====");
    console.log("")
})
