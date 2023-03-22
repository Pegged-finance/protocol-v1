import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/deploy";
import "./tasks/faucet";

const config: HardhatUserConfig = {
  networks: {
    optimism: {
      url: process.env.OPTIMISM_RPC!,
      chainId: 10,
      accounts: {
        mnemonic: "baby baby baby baby baby baby baby baby baby baby baby baby"
      }
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC!,
      chainId: 42161,
      accounts: {
        mnemonic: "baby baby baby baby baby baby baby baby baby baby baby baby"
      }
    }
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
};

export default config;
