import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:Comptroller", "Deploy comptroller")
    .addParam("unitroller", "Unitroller address")
    .setAction(async (taskArgs, hre) => {
        const unitroller = await hre.ethers.getContractAt("Unitroller", taskArgs.unitroller);

        const Comptroller = await hre.ethers.getContractFactory("Comptroller");
        const comptroller = await Comptroller.deploy();
        console.log(`Comptroller deployed, address: ${comptroller.address}`);

        await (await unitroller._setPendingImplementation(comptroller.address)).wait();
        await (await comptroller._become(unitroller.address)).wait();
        console.log("Unitroller 🤝 Comptroller")

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
        deployments["comptroller"] = comptroller.address;
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify ${comptroller.address}`);
        console.log("====");
        console.log("")
    })