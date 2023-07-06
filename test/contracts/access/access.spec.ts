import { expect } from 'chai';
import { ZERO_ADDRESS } from '../../../src/constants/accounts';
import { ACCESS_CONTROL_INTERFACE_ID } from '../../../src/constants/interfaces';
import { SUPER_ADMIN_ROLE } from '../../../src/constants/roles';
import { INITIALIZER, USER1, USER2 } from '../../helpers/Accounts';
import { createIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';
import { shouldSupportInterface } from '../../helpers/ERC165Helper';
import { ROLE1, ROLE2 } from '../../helpers/Roles';

describe('IAccessControl', () => {
  shouldSupportInterface('IAccessControl', () => createIdentityNFT(), ACCESS_CONTROL_INTERFACE_ID);
});

describe('SuperUser initialized with zero address', () => {
  it('should set caller as super admin', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.true;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.false;
  });

  it('should allow caller to change roles', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await identityNFT.grantRole(ROLE1, USER1.address);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.true;
  });

  it('should not allow others to change roles', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await expect(identityNFT.connect(USER1).grantRole(ROLE1, USER1.address)).to.be.revertedWith(/missing role/);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.false;
  });
});

describe('SuperUser initialized with another address', () => {
  it('should set caller as super admin', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: USER1.address });
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(SUPER_ADMIN_ROLE, INITIALIZER.address)).to.be.false;
  });

  it('should allow caller to change roles', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: USER1.address });
    await identityNFT.connect(USER1).grantRole(ROLE1, USER2.address);

    expect(await identityNFT.hasRole(ROLE1, USER2.address)).to.be.true;
  });

  it('should not allow others to change roles', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: USER1.address });
    await expect(identityNFT.connect(USER2).grantRole(ROLE1, USER2.address)).to.be.revertedWith(/missing role/);

    expect(await identityNFT.hasRole(ROLE1, USER2.address)).to.be.false;
  });
});

describe('grantRole', async () => {
  it('should grant the role to the given user', async () => {
    const identityNFT = await createIdentityNFT();

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.false;

    await identityNFT.grantRole(ROLE1, USER1.address);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(ROLE2, USER1.address)).to.be.false;
    expect(await identityNFT.hasRole(ROLE1, USER2.address)).to.be.false;
  });

  it('should not fail if called by other than role admin', async () => {
    const identityNFT = await createIdentityNFT();

    await expect(identityNFT.connect(USER1).grantRole(ROLE1, USER2.address)).to.be.revertedWith(/missing role/);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.false;
  });

  it('should emit RoleGranted', async () => {
    const identityNFT = await createIdentityNFT();

    expect(await identityNFT.grantRole(ROLE1, USER1.address))
      .to.emit(identityNFT, 'RoleGranted')
      .withArgs(ROLE1, USER1.address, INITIALIZER.address);
  });
});

describe('revokeRole', async () => {
  it('should remove the role from the given user', async () => {
    const identityNFT = await createIdentityNFT();

    await identityNFT.grantRole(ROLE1, USER1.address);
    await identityNFT.grantRole(ROLE2, USER1.address);
    await identityNFT.grantRole(ROLE1, USER2.address);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(ROLE2, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(ROLE1, USER2.address)).to.be.true;

    await identityNFT.revokeRole(ROLE1, USER1.address);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.false;
    expect(await identityNFT.hasRole(ROLE2, USER1.address)).to.be.true;
    expect(await identityNFT.hasRole(ROLE1, USER2.address)).to.be.true;
  });

  it('should not fail if called by other than role admin', async () => {
    const identityNFT = await createIdentityNFT();

    await identityNFT.grantRole(ROLE1, USER1.address);

    await expect(identityNFT.connect(USER1).revokeRole(ROLE1, USER2.address)).to.be.revertedWith(/missing role/);

    expect(await identityNFT.hasRole(ROLE1, USER1.address)).to.be.true;
  });

  it('should emit RoleRevoked', async () => {
    const identityNFT = await createIdentityNFT();

    await identityNFT.grantRole(ROLE1, USER1.address);

    expect(await identityNFT.revokeRole(ROLE1, USER1.address))
      .to.emit(identityNFT, 'RoleRevoked')
      .withArgs(ROLE1, USER1.address, INITIALIZER.address);
  });
});
