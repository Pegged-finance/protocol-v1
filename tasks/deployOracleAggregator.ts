import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";


task("deploy:OracleAggregator", "Deploy oracle aggregator")
    .addParam("unitroller", "Unitroller address")
    .addVariadicPositionalParam("oracles", "List of oracles")
    .setAction(async (taskArgs, hre) => {
        const comptroller = await hre.ethers.getContractAt("Comptroller", taskArgs.unitroller);

        const OracleAggregator = await hre.ethers.getContractFactory("OracleAggregator");
        const oracleAggregator = await OracleAggregator.deploy(taskArgs.oracles);

        console.log(`OracleAggregator deployed, address: ${oracleAggregator.address}`);
        await (await comptroller._setPriceOracle(oracleAggregator.address)).wait()
        console.log(`Comptroller 🤝 OracleAggregator`)

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        const deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));
        deployments["OracleAggregator"] = oracleAggregator.address;
        writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 2))


        const constructorArgsFilePath = `./deployments/${hre.network.name}-OracleAggregator-constructorArgs.js`;
        writeFileSync(`./deployments/${hre.network.name}-OracleAggregator-deploymentParams.js`,
            `module.exports = [${JSON.stringify(taskArgs.oracles)}]`
        )

        console.log("Commands for verifications:");
        console.log(`npx hardhat --network ${hre.network.name} verify --constructor-args ${constructorArgsFilePath} ${oracleAggregator.address}`);
        console.log("====");
        console.log("")
    })