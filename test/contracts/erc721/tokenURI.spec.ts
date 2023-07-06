import { expect } from 'chai';
import { IDENTITY_MANAGER_ROLE, PAUSER_ROLE } from '../../../src/constants/roles';
import { INITIALIZER, USER1, USER2 } from '../../helpers/Accounts';
import { createIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';

describe('setBaseURI', () => {
  it('should set baseURI', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, USER1.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

    expect(await identityNFT.tokenURI(10)).to.eq('');

    await identityNFT.connect(USER1).setBaseURI('the-base/');

    expect(await identityNFT.baseURI()).to.eq('the-base/');
    expect(await identityNFT.tokenURI(10)).to.eq('the-base/10');
  });

  it('should fail if not called with identity manager', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

    expect(identityNFT.connect(USER1).setBaseURI('the-base/')).to.be.revertedWith(/missing role/);

    expect(await identityNFT.tokenURI(10)).to.eq('');
  });

  it('should fail when paused', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
    await identityNFT.connect(INITIALIZER).pause();

    expect(identityNFT.connect(INITIALIZER).setBaseURI('the-base/')).to.be.revertedWith(/paused/);
  });
});

describe('setTokenURI', () => {
  it('should set the individual token uri', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

    expect(await identityNFT.tokenURI(10)).to.eq('');

    await identityNFT.connect(INITIALIZER).setTokenURI(10, 'the-best-token');

    expect(await identityNFT.tokenURI(10)).to.eq('the-best-token');
  });

  it('should fail if not called with identity manager', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
    await identityNFT.transferOwnership(USER1.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

    expect(identityNFT.connect(USER1).setTokenURI(10, 'the-best-token')).to.be.revertedWith(/missing role/);

    expect(await identityNFT.tokenURI(10)).to.eq('');
  });

  it('should fail if called with an invalid tokenId', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

    expect(identityNFT.connect(USER1).setTokenURI(100, 'the-best-token')).to.be.revertedWith(/missing role/);
  });

  it('should fail if paused', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

    await identityNFT.connect(INITIALIZER).pause();
    expect(identityNFT.connect(INITIALIZER).setTokenURI(10, 'the-best-token')).to.be.revertedWith(/paused/);
  });
});

describe('tokenURI', () => {
  it('should return the concatenated uri when both are set', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

    await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
    await identityNFT.connect(INITIALIZER).mint(USER2.address, 11);

    expect(await identityNFT.tokenURI(10)).to.eq('');

    await identityNFT.connect(INITIALIZER).setBaseURI('the-base/');
    await identityNFT.connect(INITIALIZER).setTokenURI(10, 'the-best-token');

    expect(await identityNFT.tokenURI(10)).to.eq('the-base/the-best-token');
    expect(await identityNFT.tokenURI(11)).to.eq('the-base/11');
  });
});
