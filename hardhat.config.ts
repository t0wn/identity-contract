import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import { HardhatUserConfig } from 'hardhat/config';
import { etherscanApiKey, networks } from './.secrets.json';

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },

  typechain: {
    externalArtifacts: [],
    outDir: 'types/contracts',
    target: 'ethers-v5',
  },

  networks,

  etherscan: {
    apiKey: etherscanApiKey,
  },
};

export default hardhatConfig;
