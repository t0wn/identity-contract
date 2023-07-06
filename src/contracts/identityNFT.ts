import { TransactionRequest } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { TownIdentityNFT, TownIdentityNFT__factory } from '../../types/contracts';
import { ContractAddress, EthereumAddress, ZERO_ADDRESS } from '../constants/accounts';
import { buildDeployUpgradeableProxyTransactionRequest, deployUpgradeableProxy } from './upgradeableProxy';

export interface TownIdentityNFTInitParams {
  // the name of the token
  name: string;

  // the symbol for the token
  symbol: string;

  // the super-admin address. Default is the caller.
  superAdmin: EthereumAddress;
}

export const defaultIdentityNFTInitParams: TownIdentityNFTInitParams = {
  name: '',
  symbol: '',
  superAdmin: ZERO_ADDRESS,
};

/**
 * Creates and initializes an upgradeable Identity contract using the already-deployed
 * IdentityNFT contract for implementation
 *
 * @param signer the signer to use to deploy the proxy
 * @param identityNFTLogicAddress the deployed parcel contract that will be used for logic
 * @param initParams (optional) the initialization parameters
 */
export const createIdentityNFT = async (
  signer: Signer,
  identityNFTLogicAddress: ContractAddress,
  initParams: Partial<TownIdentityNFTInitParams> = {},
): Promise<TownIdentityNFT> => {
  const initFunction = TownIdentityNFT__factory.createInterface().encodeFunctionData('initialize', [
    { ...defaultIdentityNFTInitParams, ...initParams },
  ]);
  const proxy = await deployUpgradeableProxy(signer, identityNFTLogicAddress, initFunction);
  return TownIdentityNFT__factory.connect(proxy.address, signer);
};

/**
 * Builds a transaction request to create and initialize an upgradeable Parcel NFT contract using the already-deployed
 * IdentityNFT contract for implementation
 *
 * @param identityNFTLogicAddress the deployed parcel contract that will be used for logic
 * @param initParams (optional) the initialization parameters
 */
export const buildCreateIdentityNFTTransactionRequest = (
  identityNFTLogicAddress: ContractAddress,
  initParams: Partial<TownIdentityNFTInitParams> = {},
): TransactionRequest =>
  buildDeployUpgradeableProxyTransactionRequest(identityNFTLogicAddress, buildIdentityNFTInitFunction(initParams));

/**
 * Builds the initialization function for the IdentityNFT contract with the given inputs
 * @param initParams (optional) the initialization parameters
 */
export const buildIdentityNFTInitFunction = (initParams: Partial<TownIdentityNFTInitParams> = {}) =>
  TownIdentityNFT__factory.createInterface().encodeFunctionData('initialize', [
    { ...defaultIdentityNFTInitParams, ...initParams },
  ]);
