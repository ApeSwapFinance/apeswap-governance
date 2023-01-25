import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import MasterApeAdminV2Build from '../../build-apeswap/contracts/MasterApeAdminV2.json'
import { MasterApeAdminV2 } from '../../types/ethers-contracts/MasterApeAdminV2'
import { ADDRESS_0 } from '../constants'

export default class MasterApeAdminV2Encoder {
    masterApeAdminV2Contract: MasterApeAdminV2;

    constructor(address = ADDRESS_0) {
        this.masterApeAdminV2Contract = new Contract(address, MasterApeAdminV2Build.abi) as MasterApeAdminV2;
    }

    async encodeAcceptMasterApeV2Ownership(): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.acceptMasterApeV2Ownership();
    }

    /** Contract Whitelist Functions */

    async encodeSetBatchContractWhitelist(addresses: string[], isWhitelisted: boolean[]): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setBatchContractWhitelist(addresses, isWhitelisted);
    }

    async encodeSetContractWhitelist(address: string, isWhitelisted: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setContractWhitelist(address, isWhitelisted);
    }

    /** onlyOwner Functions */

    async encodeSetPendingMasterApeV1Owner(newOwner: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setPendingMasterApeV1Owner(newOwner);
    }

    async encodeSetPendingMasterApeV2Owner(newOwner: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setPendingMasterApeV2Owner(newOwner);
    }

    async encodeUpdateMasterApeV2EmissionRate(newEmissionRate: string | number, withUpdate: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.updateEmissionRate(newEmissionRate, withUpdate);
    }

    async encodeUpdateHardCap(hardCap: string | number): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.updateHardCap(hardCap);
    }

    async setWhitelistEnabled(enabled: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setWhitelistEnabled(enabled);
    }

    async encodeSweepTokens(tokenAddresses: string[], toAddress: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.sweepTokens(tokenAddresses, toAddress);
    }

    /** onlyFarmAdmin Functions */

    async encodeSyncFixedPercentFarms(): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.syncFixedPercentFarms();
    }

    async encodeTransferFarmAdminOwnership(newFarmAdmin: string): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.transferFarmAdminOwnership(newFarmAdmin);
    }

    async encodeAddMasterApeFarms(allocationPoints: (string | number)[], lpTokens: string[], depositFeesBP: (string | number)[], rewarders: string[], withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.addMasterApeFarms(allocationPoints, lpTokens, depositFeesBP, rewarders, withPoolUpdate, syncFixedPercentageFarms);
    }
    
    async encodeSetMasterApeFarms(pids: (string | number)[],  allocationPoints: (string | number)[], depositFeesBP: (string | number)[], rewarders: string[], withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setMasterApeFarms(pids, allocationPoints, depositFeesBP, rewarders, withPoolUpdate, syncFixedPercentageFarms);
    }

    async encodeAddFixedPercentFarmAllocation(pid: string | number,  allocationPercentage: string | number, withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.addFixedPercentFarmAllocation(pid, allocationPercentage, withPoolUpdate, syncFixedPercentageFarms);
    }

    async encodeSetFixedPercentFarmAllocation(pid: string | number,  allocationPercentage: string | number, withPoolUpdate: boolean, syncFixedPercentageFarms: boolean): Promise<PopulatedTransaction> {
        return await this.masterApeAdminV2Contract.populateTransaction.setFixedPercentFarmAllocation(pid, allocationPercentage, withPoolUpdate, syncFixedPercentageFarms);
    }
}
