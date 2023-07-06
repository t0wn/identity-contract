import { expect } from 'chai';
import { PAUSER_ROLE } from '../../../src/constants/roles';
import { INITIALIZER, USER1, USER2 } from '../../helpers/Accounts';
import { createIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';

describe('pause', () => {
  it('should pause the contract', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    expect(await identityNFT.paused()).to.be.false;

    await identityNFT.grantRole(PAUSER_ROLE, USER1.address);

    await identityNFT.connect(USER1).pause();

    expect(await identityNFT.paused()).to.be.true;
  });

  it('should fail if called by non-pauser', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);
    await identityNFT.transferOwnership(USER1.address);

    expect(identityNFT.connect(USER1).pause()).to.be.revertedWith(/missing role/);

    expect(await identityNFT.paused()).to.be.false;

    await identityNFT.grantRole(PAUSER_ROLE, USER1.address);
    await identityNFT.connect(USER1).transferOwnership(USER2.address);

    expect(identityNFT.connect(USER2).pause()).to.be.revertedWith(/missing role/);

    expect(await identityNFT.paused()).to.be.false;
  });

  it('should fail if called when paused', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.pause();

    expect(identityNFT.pause()).to.be.revertedWith(/paused/);

    expect(await identityNFT.paused()).to.be.true;
  });

  it('should send a Paused event', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    expect(await identityNFT.pause())
      .to.emit(identityNFT, 'Paused')
      .withArgs(INITIALIZER.address);
  });
});

describe('unpause', () => {
  it('should unpause the contract', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.pause();

    expect(await identityNFT.paused()).to.be.true;

    await identityNFT.grantRole(PAUSER_ROLE, USER1.address);

    await identityNFT.connect(USER1).unpause();

    expect(await identityNFT.paused()).to.be.false;
  });

  it('should fail if called by non-pauser', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);
    await identityNFT.transferOwnership(USER1.address);

    await identityNFT.pause();

    expect(identityNFT.connect(USER1).unpause()).to.be.revertedWith(/missing role/);

    expect(await identityNFT.paused()).to.be.true;

    await identityNFT.unpause();
    await identityNFT.connect(USER1).transferOwnership(USER2.address);
    await identityNFT.pause();

    await identityNFT.grantRole(PAUSER_ROLE, USER1.address);

    expect(identityNFT.connect(USER2).unpause()).to.be.revertedWith(/missing role/);

    expect(await identityNFT.paused()).to.be.true;
  });

  it('should fail if called when unpaused', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    expect(identityNFT.unpause()).to.be.revertedWith(/not paused/);

    expect(await identityNFT.paused()).to.be.false;
  });

  it('should send a Unpaused event', async () => {
    const identityNFT = await createIdentityNFT();
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.pause();

    expect(await identityNFT.unpause())
      .to.emit(identityNFT, 'Unpaused')
      .withArgs(INITIALIZER.address);
  });
});
