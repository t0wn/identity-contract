import { defaultIdentityNFTInitParams, TownIdentityNFTInitParams } from '../../../src/contracts/identityNFT';
import { TownIdentityNFT__factory } from '../../../types/contracts';
import { INITIALIZER } from '../Accounts';

export const createIdentityNFT = async (initParams: Partial<TownIdentityNFTInitParams> = {}) => {
  const identityNFT = await deployIdentityNFT();
  await identityNFT.initialize({ ...defaultIdentityNFTInitParams, ...initParams });
  return identityNFT;
};

export const deployIdentityNFT = async () => new TownIdentityNFT__factory(INITIALIZER).deploy();
