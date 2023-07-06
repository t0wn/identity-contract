import { BytesLike } from 'ethers';
import { Hexable, keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { toByte32String } from '../utils/fixedBytes';

export type AccessRole = string;

export const toAccessRole = (value: BytesLike | Hexable | number): AccessRole => toByte32String(value);

export const SUPER_ADMIN_ROLE = toAccessRole(0);
export const IDENTITY_MANAGER_ROLE = keccak256(toUtf8Bytes('tOwn.IdentityManager'));
export const PAUSER_ROLE = keccak256(toUtf8Bytes('tOwn.Pauser'));
export const UPGRADER_ROLE = keccak256(toUtf8Bytes('tOwn.Upgrader'));
export const OWNERSHIP_MANAGER_ROLE = keccak256(toUtf8Bytes('tOwn.OwnershipManager'));
