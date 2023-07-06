// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

library Roles {
  bytes32 public constant SUPER_ADMIN = 0x00;
  bytes32 public constant OWNERSHIP_MANAGER = keccak256('tOwn.OwnershipManager');
  bytes32 public constant IDENTITY_MANAGER = keccak256('tOwn.IdentityManager');
  bytes32 public constant PAUSER = keccak256('tOwn.Pauser');
  bytes32 public constant UPGRADER = keccak256('tOwn.Upgrader');
}
