import { expect } from 'chai';
import { SUPER_ADMIN_ROLE } from '../../../src/constants/roles';
import { INITIALIZER, USER1, USER2 } from '../../helpers/Accounts';
import { deployIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';

describe('initialize', () => {
  it('should initialize the contract', async () => {
    const identityNFT = await deployIdentityNFT();

    expect(await identityNFT.name()).to.eq('');
    expect(await identityNFT.symbol()).to.eq('');
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.false;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.false;

    await identityNFT.initialize({ name: 'the name', symbol: 'the symbol', superAdmin: USER1.address });

    expect(await identityNFT.name()).to.eq('the name');
    expect(await identityNFT.symbol()).to.eq('the symbol');
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.false;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.true;
  });

  it('should not allow initialization twice', async () => {
    const identityNFT = await deployIdentityNFT();
    await identityNFT.initialize({ name: 'the name', symbol: 'the symbol', superAdmin: USER1.address });

    expect(
      identityNFT.initialize({ name: 'the new name', symbol: 'the new symbol', superAdmin: USER2.address }),
    ).to.be.revertedWith(/contract is already initialized/);

    expect(await identityNFT.name()).to.eq('the name');
    expect(await identityNFT.symbol()).to.eq('the symbol');
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.false;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER2.address)).to.be.false;
  });
});
