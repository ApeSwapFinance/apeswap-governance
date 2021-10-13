import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import AccessControlBuild from '../../build/contracts/AccessControl.json'
import { AccessControl } from '../../types/ethers-contracts/AccessControl'
import { BytesLike } from 'ethers';
import { ADDRESS_0 } from '../constants'

interface RoleInput {
    role: BytesLike;
    account: string;
}

export default class AccessControlEncoder {
    accessControlContract: AccessControl;

    constructor(address = ADDRESS_0) {
        this.accessControlContract = new Contract(address, AccessControlBuild.abi) as AccessControl;
    }

    async encodeGrantRole({ role, account }: RoleInput): Promise<PopulatedTransaction> {
        return await this.accessControlContract.populateTransaction.grantRole(role, account);
    }

    async encodeRevokeRole({ role, account }: RoleInput): Promise<PopulatedTransaction> {
        return await this.accessControlContract.populateTransaction.revokeRole(role, account);
    }

    async encodeRenounceRole({ role, account }: RoleInput): Promise<PopulatedTransaction> {
        return await this.accessControlContract.populateTransaction.renounceRole(role, account);
    }
}
