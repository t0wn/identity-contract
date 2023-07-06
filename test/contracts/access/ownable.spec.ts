import { expect } from 'chai';
import { ZERO_ADDRESS } from '../../../src/constants/accounts';
import {
  OWNERSHIP_MANAGER_ROLE,
  IDENTITY_MANAGER_ROLE,
  PAUSER_ROLE,
  SUPER_ADMIN_ROLE,
  UPGRADER_ROLE,
} from '../../../src/constants/roles';
import { encodeTransferOwnershipFunction } from '../../../src/contracts/ownable';
import { createIdentityNFT as createIdentityNFTProxy } from '../../../src/contracts/identityNFT';
import { INITIALIZER, USER1 } from '../../helpers/Accounts';
import { createIdentityNFT, deployIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';

describe('Owner initialized with zero address', () => {
  it('should set caller as super admin', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    expect(await identityNFT.owner()).to.eq(INITIALIZER.address);
  });
});

describe('Owner initialized with another address', () => {
  it('should set caller as super admin', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: USER1.address });
    expect(await identityNFT.owner()).to.eq(USER1.address);
  });
});

describe('transferOwnership', () => {
  it('should transfer ownership if owner', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await identityNFT.transferOwnership(USER1.address);

    expect(await identityNFT.owner()).to.eq(USER1.address);
  });

  it('should transfer ownership if ownership manager', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await identityNFT.grantRole(OWNERSHIP_MANAGER_ROLE, USER1.address);

    await identityNFT.connect(USER1).transferOwnership(USER1.address);

    expect(await identityNFT.owner()).to.eq(USER1.address);
  });

  it('should fail to transfer ownership when not owner or ownership manager', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await identityNFT.grantRole(SUPER_ADMIN_ROLE, USER1.address);
    await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, USER1.address);
    await identityNFT.grantRole(PAUSER_ROLE, USER1.address);
    await identityNFT.grantRole(UPGRADER_ROLE, USER1.address);

    await expect(identityNFT.connect(USER1).transferOwnership(USER1.address)).to.be.revertedWith(
      /caller is not the owner nor ownership manager/,
    );

    expect(await identityNFT.owner()).to.eq(INITIALIZER.address);
  });

  it('should fail to transfer ownership when paused', async () => {
    const identityNFT = await createIdentityNFT({ superAdmin: ZERO_ADDRESS });
    await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

    await identityNFT.pause();

    await expect(identityNFT.transferOwnership(USER1.address)).to.be.revertedWith(/paused/);

    expect(await identityNFT.owner()).to.eq(INITIALIZER.address);
  });
});

describe('setOwner', () => {
  it('should set owner during upgrade', async () => {
    const identityNFTLogic = await deployIdentityNFT();
    const identityNFT = await createIdentityNFTProxy(INITIALIZER, identityNFTLogic.address);
    await identityNFT.grantRole(UPGRADER_ROLE, INITIALIZER.address);
    await identityNFT.grantRole(OWNERSHIP_MANAGER_ROLE, INITIALIZER.address);

    // reset it back to as if it were uninitialized
    await identityNFT.renounceOwnership();

    const newIdentityNFTLogic = await deployIdentityNFT();
    await identityNFT.upgradeToAndCall(newIdentityNFTLogic.address, encodeTransferOwnershipFunction(USER1.address));

    expect(await identityNFT.owner()).to.eq(USER1.address);
  });
});
