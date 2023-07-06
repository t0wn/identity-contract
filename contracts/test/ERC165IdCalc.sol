// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import '@gnus.ai/contracts-upgradeable-diamond/contracts/access/IAccessControlUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/token/ERC721/IERC721Upgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
import '@gnus.ai/contracts-upgradeable-diamond/contracts/token/ERC721/extensions/IERC721MetadataUpgradeable.sol';
import '../common/IERC5484.sol';

library ERC165IdCalc {
  function calcAccessControlInterfaceId() external pure returns (bytes4) {
    return type(IAccessControlUpgradeable).interfaceId;
  }

  function calcERC5484InterfaceId() external pure returns (bytes4) {
    return type(IERC5484).interfaceId;
  }

  function calcERC721InterfaceId() external pure returns (bytes4) {
    return type(IERC721Upgradeable).interfaceId;
  }

  function calcERC721EnumerableInterfaceId() external pure returns (bytes4) {
    return type(IERC721EnumerableUpgradeable).interfaceId;
  }

  function calcERC721MetadataInterfaceId() external pure returns (bytes4) {
    return type(IERC721MetadataUpgradeable).interfaceId;
  }
}
