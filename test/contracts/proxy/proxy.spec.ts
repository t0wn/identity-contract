import { expect } from 'chai';
import { SUPER_ADMIN_ROLE, UPGRADER_ROLE } from '../../../src/constants/roles';
import { createIdentityNFT } from '../../../src/contracts/identityNFT';
import { getProxyImplementationAddress } from '../../../src/contracts/upgradeableProxy';
import { INITIALIZER, USER1 } from '../../helpers/Accounts';
import { deployIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';
import { asProxy } from '../../helpers/contracts/ProxyHelper';

describe('createIdentityNFT', () => {
  it('should create and initialize the contract', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFT(INITIALIZER, identityNFTLogic.address, { superAdmin: USER1.address });

    expect(await getProxyImplementationAddress(asProxy(identityNFT))).to.eq(identityNFTLogic.address);

    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.false;
  });

  it('should create upgradeable contract', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFT(INITIALIZER, identityNFTLogic.address);
    await identityNFT.grantRole(UPGRADER_ROLE, INITIALIZER.address);

    const newIdentityNFTLogic = await deployIdentityNFT();
    await identityNFT.upgradeTo(newIdentityNFTLogic.address);

    expect(await getProxyImplementationAddress(asProxy(identityNFT))).to.eq(newIdentityNFTLogic.address);
  });

  it('should fail to upgrade when not an upgrader', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFT(INITIALIZER, identityNFTLogic.address);
    await identityNFT.grantRole(UPGRADER_ROLE, INITIALIZER.address);
    await identityNFT.transferOwnership(USER1.address);

    const newIdentityNFTLogic = await deployIdentityNFT();
    await expect(identityNFT.connect(USER1).upgradeTo(newIdentityNFTLogic.address)).to.be.revertedWith(/missing role/);

    expect(await getProxyImplementationAddress(asProxy(identityNFT))).to.eq(identityNFTLogic.address);
  });
});

describe('upgradeTo', () => {
  it('should upgrade contract', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFT(INITIALIZER, identityNFTLogic.address);
    await identityNFT.grantRole(UPGRADER_ROLE, INITIALIZER.address);

    const newIdentityNFTLogic = await deployIdentityNFT();
    await identityNFT.upgradeTo(newIdentityNFTLogic.address);

    expect(await getProxyImplementationAddress(asProxy(identityNFT))).to.eq(newIdentityNFTLogic.address);
  });

  it('should fail to upgrade when not an upgrader', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFT(INITIALIZER, identityNFTLogic.address);
    await identityNFT.grantRole(UPGRADER_ROLE, INITIALIZER.address);
    await identityNFT.transferOwnership(USER1.address);

    const newIdentityNFTLogic = await deployIdentityNFT();
    await expect(identityNFT.connect(USER1).upgradeTo(newIdentityNFTLogic.address)).to.be.revertedWith(/missing role/);

    expect(await getProxyImplementationAddress(asProxy(identityNFT))).to.eq(identityNFTLogic.address);
  });
});
