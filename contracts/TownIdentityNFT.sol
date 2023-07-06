// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import '@gnus.ai/contracts-upgradeable-diamond/contracts/access/AccessControlUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/access/OwnableUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/proxy/utils/UUPSUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/security/PausableUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import './common/TokenUriStorage.sol';
import './Roles.sol';
import './common/IERC5484.sol';

contract TownIdentityNFT is
  UUPSUpgradeable,
  ERC721EnumerableUpgradeable,
  ERC721URIStorageUpgradeable,
  IERC5484,
  AccessControlUpgradeable,
  OwnableUpgradeable,
  PausableUpgradeable
{
  struct InitParams {
    string name;
    string symbol;
    address superAdmin;
  }

  function initialize(InitParams memory initParams) public initializer {
    __ERC721_init(initParams.name, initParams.symbol);
    __ERC721Enumerable_init_unchained();
    __ERC721URIStorage_init_unchained();
    __AccessControl_init_unchained();
    __Pausable_init_unchained();

    if (initParams.superAdmin == address(0)) {
      initParams.superAdmin = _msgSender();
    }
    _setupRole(Roles.SUPER_ADMIN, initParams.superAdmin);
    _transferOwnership(initParams.superAdmin);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(AccessControlUpgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  /**
   * @notice Gets base URI for all tokens, if set.
   */
  function baseURI() public view returns (string memory) {
    return _baseURI();
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return TokenUriStorage.baseURI();
  }

  /**
   * @notice Sets `baseURI` as the base URI for all tokens. Used when explicit tokenURI not set.
   */
  function setBaseURI(string calldata __baseURI) external onlyRole(Roles.IDENTITY_MANAGER) whenNotPaused {
    TokenUriStorage.setBaseURI(__baseURI);
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(
    uint256 tokenId
  ) public view virtual override(ERC721URIStorageUpgradeable, ERC721Upgradeable) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  /**
   * @notice Sets `_tokenURI` as the tokenURI of `tokenId`.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function setTokenURI(
    uint256 tokenId,
    string memory _tokenURI
  ) external onlyRole(Roles.IDENTITY_MANAGER) whenNotPaused {
    _setTokenURI(tokenId, _tokenURI);
  }

  /**
   * @notice Triggers stopped state.
   *
   * Requirements:
   *
   * - The contract must not be paused.
   */
  function pause() external onlyRole(Roles.PAUSER) {
    _pause();
  }

  /**
   * @notice Returns to normal state.
   *
   * Requirements:
   *
   * - The contract must be paused.
   */
  function unpause() external onlyRole(Roles.PAUSER) {
    _unpause();
  }

  function transferOwnership(address newOwner) public virtual override whenNotPaused {
    address sender = _msgSender();
    require(
      owner() == sender || hasRole(Roles.OWNERSHIP_MANAGER, sender),
      'Ownable: caller is not the owner nor ownership manager.'
    );
    require(newOwner != address(0), 'Ownable: new owner is the zero address');
    _transferOwnership(newOwner);
  }

  function exists(uint256 tokenId) external view returns (bool) {
    return _exists(tokenId);
  }

  function mint(address to, uint256 tokenId) external onlyRole(Roles.IDENTITY_MANAGER) {
    require(balanceOf(to) == 0, 'ERC721: token already minted to address');
    _mint(to, tokenId);
    emit Issued(address(0), to, tokenId, BurnAuth.Both);
  }

  function burnAuth(uint256 /*tokenId*/) external pure returns (BurnAuth) {
    return BurnAuth.Both;
  }

  function burn(uint256 tokenId) external whenNotPaused {
    address account = _msgSender();
    require(
      account == ownerOf(tokenId) || hasRole(Roles.IDENTITY_MANAGER, account),
      'ERC721: must be owner or identity manager to burn'
    );
    _burn(tokenId);
  }

  function _burn(uint256 tokenId) internal virtual override(ERC721URIStorageUpgradeable, ERC721Upgradeable) {
    super._burn(tokenId);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId,
    uint256 batchSize
  ) internal virtual override(ERC721EnumerableUpgradeable, ERC721Upgradeable) whenNotPaused {
    super._beforeTokenTransfer(from, to, tokenId, batchSize);

    require(from == address(0) || to == address(0), 'ERC721: token transfer not allowed');
  }

  // solhint-disable-next-line no-empty-blocks
  function _authorizeUpgrade(address newImplementation) internal virtual override onlyRole(Roles.UPGRADER) {}
}
