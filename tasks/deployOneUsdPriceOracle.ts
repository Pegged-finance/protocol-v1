import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:OneUsdPriceOracle", "Deploy price oracle")
    .addParam("unitroller", "Unitroller address")
    .setAction(async (taskArgs, hre) => {
        const comptroller = await hre.ethers.getContractAt("Comptroller", taskArgs.unitroller);

        const OneUsdPriceOracle = await hre.ethers.getContractFactory("OneUsdPriceOracle");
        const oneUsdPriceOracle = await OneUsdPriceOracle.deploy();

        console.log(`OneUsdPriceOracle deployed, address: ${oneUsdPriceOracle.address}`);
        await (await comptroller._setPriceOracle(oneUsdPriceOracle.address)).wait()
        console.log(`Comptroller 🤝 oneUsdPriceOracle`)

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
        deployments["oneUsdPriceOracle"] = oneUsdPriceOracle.address;
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify ${oneUsdPriceOracle.address}`);
        console.log("====");
        console.log("")
    })