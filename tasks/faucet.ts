import { task } from "hardhat/config";

const WHALES = {
    arbitrum: {
        USDC: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
        USDT: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
        DAI: "0xC948eB5205bDE3e18CAc4969d6ad3a56ba7B2347",
        MIM: "0xa19ed0aE46e89461e56063f1eD268a0dc225745f",
        FRAX: "0x5F153A7d31b315167Fe41dA83acBa1ca7F86E91d",
        VST: "0x4a4651b31d747d1ddbddadcf1b1e24a5f6dcc7b0",
        MAI: "0x0000000000000000000000000000000000000001",
        LUSD: "0x156E6C5a2Fac34bB2Fcf2Ac1bbAA0E75BDE3aC4F",
        DOLA: "0x68FEb25d10725EE055718305e89802478D1A661b"
    }
}

const TOKENS = {
    arbitrum: {
        USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        MIM: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
        FRAX: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
        VST: "0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17",
        MAI: "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d",
        LUSD: "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
        DOLA: "0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6"
    }
}



task("faucet", "Get tokens")
    .addParam("to", "Recipient address")
    .addParam("token", "Token symbol")
    .addParam("amount", "Amount")
    .setAction(async (taskArgs, hre) => {
        const tokenAddress = TOKENS[hre.network.name][taskArgs.token];
        if (tokenAddress === undefined)
            throw Error(`Couldn't faucet ${taskArgs.token} on ${hre.network.name}`);
        const token = await hre.ethers.getContractAt(
            "IERC20Metadata", tokenAddress
        );
        const decimals = await token.decimals();

        const whale = WHALES[hre.network.name][taskArgs.token];

        await hre.network.provider.send("evm_addAccount", [whale, ""]);
        await hre.network.provider.send("personal_unlockAccount", [whale, ""])

        hre.network.provider = new hre.ethers.providers.JsonRpcProvider(
            hre.network.config.url
        );
        await hre.network.provider.send("eth_sendTransaction", [{
            from: whale,
            to: tokenAddress,
            data: token.interface.encodeFunctionData("transfer", [taskArgs.to, hre.ethers.utils.parseUnits(taskArgs.amount, decimals)]),
        }])
    })


task("faucet:all", "Get $ in every token")
    .addParam("to", "Recipient address")
    .addParam("amount", "Amount")
    .setAction(async (taskArgs, hre) => {
        await hre.network.provider.send("evm_setAccountBalance", [taskArgs.to, "0xde0b6b3a7640000"])

        for (let [token,] of Object.entries(TOKENS[hre.network.name])) {
            await hre.run("faucet", { token, ...taskArgs })
        }
    })
