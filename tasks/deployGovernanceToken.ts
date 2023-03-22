import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:GovernanceToken", "Deploy GovernanceToken")
        .addParam("unitroller", "Unitroller address")
        .addParam("totalSupply", "Total supply", "100000000")
        .setAction(async (taskArgs, hre) => {
                const totalSupply = hre.ethers.utils.parseEther(taskArgs.totalSupply);

                const Peg = await hre.ethers.getContractFactory("Peg");
                const peg = await Peg.deploy(totalSupply);
                console.log(`PEG deployed, address: ${peg.address}`);

                const comptroller = await hre.ethers.getContractAt("Comptroller", taskArgs.unitroller);

                await (await comptroller._setPeg(peg.address)).wait();
                console.log("Comptroller 🤝 PEG")

                const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
                const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
                deployments["PEG"] = peg.address;
                writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

                console.log("Commands for verifications:");
                console.log(`npx hardhat --network ${hre.network.name} verify ${peg.address} ${totalSupply}`);
                console.log("====");
                console.log("")
        })