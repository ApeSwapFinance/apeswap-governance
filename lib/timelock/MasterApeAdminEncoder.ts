import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import MasterApeAdminBuild from '../../build-apeswap/contracts/MasterApeAdmin.json'
import { MasterApeAdmin } from '../../types/ethers-contracts/MasterApeAdmin'
import { ADDRESS_0 } from '../constants'

export default class MasterApeAdminEncoder {
    masterApeAdminContract: MasterApeAdmin;

    constructor(address = ADDRESS_0) {
        this.masterApeAdminContract = new Contract(address, MasterApeAdminBuild.abi) as MasterApeAdmin;
    }

    async encodeAcceptMasterApeOwnership(): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.acceptMasterApeOwnership();
    }

    /** onlyOwner Functions */

    async encodeSetPendingMasterApeOwner(newOwner: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.setPendingMasterApeOwner(newOwner);
    }

    async encodeUpdateMasterApeMultiplier(newMultiplier: string | number): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.updateMasterApeMultiplier(newMultiplier);
    }

    async encodeSweepTokens(tokenAddresses: string[], toAddress: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.sweepTokens(tokenAddresses, toAddress);
    }

    /** onlyFarmAdmin Functions */

    async encodeSyncFixedPercentFarms(): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.syncFixedPercentFarms();
    }

    async encodeTransferFarmAdminOwnership(newFarmAdmin: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.transferFarmAdminOwnership(newFarmAdmin);
    }

    async encodeAddMasterApeFarms(allocationPoints: (string | number)[], lpTokens: string[], withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.addMasterApeFarms(allocationPoints, lpTokens, withPoolUpdate, syncFixedPercentageFarms);
    }

    async encodeSetMasterApeFarms(pids: (string | number)[],  allocationPoints: (string | number)[], withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.setMasterApeFarms(pids, allocationPoints, withPoolUpdate, syncFixedPercentageFarms);
    }

    async encodeAddFixedPercentFarmAllocation(pid: string | number,  allocationPercentage: string | number, withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.addFixedPercentFarmAllocation(pid, allocationPercentage, withPoolUpdate, syncFixedPercentageFarms);
    }

    async encodeSetFixedPercentFarmAllocation(pid: string | number,  allocationPercentage: string | number, withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminContract.populateTransaction.setFixedPercentFarmAllocation(pid, allocationPercentage, withPoolUpdate, syncFixedPercentageFarms);
    }
}
