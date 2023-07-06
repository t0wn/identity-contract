import { expect } from 'chai';
import { BigNumber } from 'ethers';
import {
  ERC721_ENUMERABLE_INTERFACE_ID,
  ERC721_INTERFACE_ID,
  ERC721_METADATA_INTERFACE_ID,
} from '../../../src/constants/interfaces';
import { IDENTITY_MANAGER_ROLE, PAUSER_ROLE } from '../../../src/constants/roles';
import { BurnAuth } from '../../../src/contracts/erc5484';
import { INITIALIZER, USER1, USER2 } from '../../helpers/Accounts';
import { createIdentityNFT } from '../../helpers/contracts/IdentityNFTHelper';
import { shouldSupportInterface } from '../../helpers/ERC165Helper';

describe('ERC721', () => {
  shouldSupportInterface('IERC721', () => createIdentityNFT(), ERC721_INTERFACE_ID);
  shouldSupportInterface('IERC721Enumerable', () => createIdentityNFT(), ERC721_ENUMERABLE_INTERFACE_ID);
  shouldSupportInterface('IERC721Metadata', () => createIdentityNFT(), ERC721_METADATA_INTERFACE_ID);
});

describe('ERC721', () => {
  describe('mint', () => {
    it('should mint the token', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      expect(await identityNFT.ownerOf(10)).to.eq(USER1.address);
    });

    it('should send issued event', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await expect(identityNFT.connect(INITIALIZER).mint(USER1.address, 10))
        .to.emit(identityNFT, 'Issued')
        .withArgs(BigNumber.from(0), USER1.address, BigNumber.from(10), BurnAuth.Both);
    });

    it('should fail to mint the token if not the identity manager', async () => {
      const identityNFT = await createIdentityNFT();

      await expect(identityNFT.connect(USER1).mint(USER1.address, 10)).to.be.revertedWith(/missing role/);
    });

    it('should fail to mint if the token already exists', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      await expect(identityNFT.connect(INITIALIZER).mint(USER1.address, 10)).to.be.revertedWith(/token already minted/);
    });

    it('should fail to mint if the user already has a token', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      await expect(identityNFT.connect(INITIALIZER).mint(USER1.address, 11)).to.be.revertedWith(
        /token already minted to address/,
      );
    });

    it('should fail to mint if paused', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
      await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);
      await identityNFT.pause();

      await expect(identityNFT.connect(INITIALIZER).mint(USER1.address, 10)).to.be.revertedWith(/paused/);
    });
  });

  describe('burn', () => {
    it('should burn the token if requested by owner', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      await identityNFT.connect(USER1).burn(10);

      expect(await identityNFT.exists(10)).to.be.false;
    });

    it('should burn the token if requested by identity manager', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      await identityNFT.connect(INITIALIZER).burn(10);

      expect(await identityNFT.exists(10)).to.be.false;
    });

    it('should fail to burn if not user or identity manager', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

      await expect(identityNFT.connect(USER2).burn(10)).to.be.revertedWith(/must be owner or identity manager to burn/);
    });

    it('should fail to burn if the token does not exist', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await expect(identityNFT.connect(INITIALIZER).burn(10)).to.be.revertedWith(/invalid token ID/);
    });

    it('should fail to burn if already burned', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      await identityNFT.connect(INITIALIZER).burn(10);

      await expect(identityNFT.connect(INITIALIZER).burn(10)).to.be.revertedWith(/invalid token ID/);
    });

    it('should fail to burn if paused', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);
      await identityNFT.grantRole(PAUSER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

      await identityNFT.pause();
      await expect(identityNFT.connect(INITIALIZER).burn(10)).to.be.revertedWith(/paused/);
    });
  });

  describe('transferFrom', () => {
    it('should fail to transfer the token', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

      await expect(identityNFT.connect(USER1).transferFrom(USER1.address, USER2.address, 10)).to.be.revertedWith(
        /token transfer not allowed/,
      );
    });
  });

  describe('safeTransferFrom', () => {
    it('should fail to transfer the token', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

      await expect(
        identityNFT.connect(USER1)['safeTransferFrom(address,address,uint256)'](USER1.address, USER2.address, 10),
      ).to.be.revertedWith(/token transfer not allowed/);
    });
  });
});

// these tests are cursory just to confirm that the implementation is included
describe('ERC721Enumerable', () => {
  // totalSupply, tokenOfOwnerByIndex, and tokenByIndex
  describe('totalSupply', () => {
    it('should return the totalSupply', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      expect(await identityNFT.totalSupply()).to.eq(0);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      expect(await identityNFT.totalSupply()).to.eq(1);

      await identityNFT.connect(INITIALIZER).mint(USER2.address, 11);
      expect(await identityNFT.totalSupply()).to.eq(2);
    });
  });

  describe('tokenOfOwnerByIndex', () => {
    it('should return the token at the given index for the given user', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      expect(await identityNFT.tokenOfOwnerByIndex(USER1.address, 0)).to.eq(10);

      await identityNFT.connect(INITIALIZER).mint(USER2.address, 11);
      expect(await identityNFT.tokenOfOwnerByIndex(USER1.address, 0)).to.eq(10);
      expect(await identityNFT.tokenOfOwnerByIndex(USER2.address, 0)).to.eq(11);
    });
  });

  describe('tokenByIndex', () => {
    it('should return the token at the given index', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);
      expect(await identityNFT.tokenByIndex(0)).to.eq(10);

      await identityNFT.connect(INITIALIZER).mint(USER2.address, 11);
      expect(await identityNFT.tokenByIndex(0)).to.eq(10);
      expect(await identityNFT.tokenByIndex(1)).to.eq(11);
    });
  });
});

describe('ERC721Metadata', () => {
  describe('name', () => {
    it('should return the name', async () => {
      const identityNFT = await createIdentityNFT({ name: 'The Name' });
      expect(await identityNFT.name()).to.eq('The Name');
    });
  });

  describe('symbol', () => {
    it('should return the symbol', async () => {
      const identityNFT = await createIdentityNFT({ symbol: 'The Symbol' });
      expect(await identityNFT.symbol()).to.eq('The Symbol');
    });
  });

  describe('tokenURI', () => {
    it('should return the token URI', async () => {
      const identityNFT = await createIdentityNFT();
      await identityNFT.grantRole(IDENTITY_MANAGER_ROLE, INITIALIZER.address);

      await identityNFT.connect(INITIALIZER).mint(USER1.address, 10);

      await identityNFT.setBaseURI('https://the.base.uri/');
      expect(await identityNFT.tokenURI(10)).to.eq('https://the.base.uri/10');
    });
  });
});
