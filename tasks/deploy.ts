import { task } from "hardhat/config";
import { readFileSync, writeFileSync } from "fs";

import "./deployCompoundLens";
import "./deployComptroller";
import "./deployGovernanceToken";
import "./deployJumpRateModelV2";
import "./deployMarket";
import "./deployOracle";
import "./deployOracleAggregator";
import "./deployUnitroller";

/*const STABLES = {
    optimism: [
        "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
        "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT
        "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
        "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9", // sUSD
        "0x8aE125E8653821E851F12A49F7765db9a9ce7384", // DOLA
        // ??? rebasement "0x73cb180bf0521828d8849bc8CF2B920918e23032", // USD+
        "0xdFA46478F9e5EA86d57387849598dbFB2e964b02", // MAI
        "0xc40f949f8a4e094d1b49a23ea9241d289b7b2819", // LUSD
        "0x2E3D870790dC77A83DD1d18184Acc7439A53f475", // FRAX
        "0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9", // USX
        "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A", // alUSD
        "0xB153FB3d196A8eB25522705560ac152eeEc57901", // MIM
    ],
    arbitrum: [
        // USX
        "0xD74f5255D557944cf7Dd0E45FF521520002D5748", // USDS
    ]
}*/

const STABLES = {
    arbitrum: [
        // USDC
        {
            "token": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            "oracle": "contracts/oracles/arbitrum/USDCChainlinkOracle.sol:USDCChainlinkOracle",
        },
        // USDT
        {
            "token": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            "oracle": "contracts/oracles/arbitrum/USDTChainlinkOracle.sol:USDTChainlinkOracle",
        },
        // DAI
        {
            "token": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            "oracle": "contracts/oracles/arbitrum/DAIChainlinkOracle.sol:DAIChainlinkOracle"
        },
        // MIM
        {
            "token": "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
            "oracle": "contracts/oracles/arbitrum/MIMChainlinkOracle.sol:MIMChainlinkOracle"
        },
        // FRAX
        {
            "token": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
            "oracle": "contracts/oracles/arbitrum/FRAXChainlinkOracle.sol:FRAXChainlinkOracle"
        },
        // VST
        {
            "token": "0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17",
            "oracle": "contracts/oracles/arbitrum/VSTCurveChainlinkOracle.sol:VSTCurveChainlinkOracle"
        },
        // MAI
        {
            "token": "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d",
            "oracle": "contracts/oracles/arbitrum/MAIRamsesChainlinkOracle.sol:MAIRamsesChainlinkOracle"
        },
        // LUSD
        {
            "token": "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
            "oracle": "contracts/oracles/arbitrum/LUSDCamelotChainlinkOracle.sol:LUSDCamelotChainlinkOracle"
        },
        // DOLA
        {
            "token": "0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6",
            "oracle": "contracts/oracles/arbitrum/DOLARamsesChainlinkOracle.sol:DOLARamsesChainlinkOracle"
        }
    ],
    optimism: []
}


task("deploy", "Deploy protocol")
    .setAction(async (taskArgs, hre) => {
        writeFileSync(`./deployments/${hre.network.name}.json`, '{"oracles": []}');

        await hre.run("compile");

        await hre.run("deploy:JumpRateModelV2", {
            baseRatePerYear: "0",
            multiplierPerYear: "50000000000000000",
            jumpMultiplierPerYear: "1365000000000000000",
            kink: "800000000000000000"
        })
        await hre.run("deploy:Unitroller");
        await hre.run("deploy:CompoundLens");

        for (let tokenInfo of STABLES[hre.network.name]) {
            console.log(`Deploying ${tokenInfo["oracle"]}`)
            await hre.run("deploy:Oracle", {
                oracleName: tokenInfo["oracle"]
            })
        }

        const deploymentsFilePath = `./deployments/${hre.network.name}.json`;
        let deployments = JSON.parse(readFileSync(deploymentsFilePath, "utf-8"));

        await hre.run("deploy:Comptroller", { unitroller: deployments["unitroller"] });
        await hre.run("deploy:GovernanceToken", { unitroller: deployments["unitroller"] });

        for (let tokenInfo of STABLES[hre.network.name]) {
            await hre.run("deploy:Market", {
                token: tokenInfo["token"],
                unitroller: deployments["unitroller"],
                interestRateModel: deployments["jumpRateModelV2"]
            })
        }

        await hre.run("deploy:OracleAggregator", {
            oracles: deployments["oracles"].map((oracleInfo) => oracleInfo.address),
            unitroller: deployments["unitroller"],
        })
    })
