import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:GovernanceToken", "Deploy GovernanceToken")
        .addParam("unitroller", "Unitroller address")
        .addParam("totalSupply", "Total supply", "100000000")
        .setAction(async (taskArgs, hre) => {
                const totalSupply = hre.ethers.utils.parseEther(taskArgs.totalSupply);

                const Pegg = await hre.ethers.getContractFactory("Pegg");
                const pegg = await Pegg.deploy(totalSupply);
                console.log(`PEGG deployed, address: ${pegg.address}`);

                const comptroller = await hre.ethers.getContractAt("Comptroller", taskArgs.unitroller);

                await (await comptroller._setPeg(pegg.address)).wait();
                console.log("Comptroller 🤝 PEGG")

                const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
                const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
                deployments["PEGG"] = pegg.address;
                writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

                console.log("Commands for verifications:");
                console.log(`npx hardhat --network ${hre.network.name} verify ${pegg.address} ${totalSupply}`);
                console.log("====");
                console.log("")
        })