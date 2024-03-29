import { writeJSONToFile } from '@defifofum/files'

import { BYTES_32 } from '../lib/constants'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminV2Encoder from '../lib/master-ape/MasterApeAdminV2Encoder';

import MASTER_APE_V2_ALLOCATIONS from './inputs/MASTER_APE_V2_ALLOCATIONS.json'

interface SetInput {
    pid: number | string
    allocation: number | string
    depositFeesBP?: number | string
    rewarder?: string
}

/**
 * This function works similarly to updating the MasterApeAdminV1 contract with a json file input,
 *  but it has two additional params which are optional.
 * 
 * IMPORTANT: If `depositFeesBP` or `rewarder` are not passed for ALL objects in the array then they will be
 *  omitted and left unchanged on the contract through the MasterApeAdminV2.
 * 
 * [{
 *      "pid": number | string,
 *      "allocation": number | string,
 *      "depositFeesBP"?: number | string,
 *      "rewarder"?: string,
 * }]
 */
async function encodeSetTxs(
    setAllocations: SetInput[],
    masterApeAdminV2Encoder: MasterApeAdminV2Encoder,
    options?: {
        withPoolUpdate?: boolean
        syncFixedPercentageFarms?: boolean
    }
) {
    const withPoolUpdate = options?.withPoolUpdate || true
    const syncFixedPercentageFarms = options?.syncFixedPercentageFarms || true

    const pids = setAllocations.map(value => value.pid);
    const setAllocationsPoints = setAllocations.map(value => value.allocation);
    if(pids.length != setAllocationsPoints.length) {
        throw new Error(`allocations array mismatch!`)
    }

    /**
     * Configure optional params
     */
    let depositFeesBPs = setAllocations.map(value => value.depositFeesBP);
    if (depositFeesBPs.includes(undefined)) {
        console.log(`WARNING: depositFeesBP are not being passed. 'undefined' found. They will remain unchanged on chain.`);
        depositFeesBPs = [];
    } else {
        if(depositFeesBPs.length != pids.length) {
            throw new Error(`depositFeesBPs array mismatch!`)
        }
    }
    let rewarders = setAllocations.map(value => value.rewarder);
    if (rewarders.includes(undefined)) {
        console.log(`WARNING: rewarders are not being passed. 'undefined' found. They will remain unchanged on chain.`);
        rewarders = [];
    } else {
        if(rewarders.length != pids.length) {
            throw new Error(`rewarders array mismatch!`)
        }
    }

    return masterApeAdminV2Encoder.encodeSetMasterApeFarms(
        pids, 
        setAllocationsPoints, 
        depositFeesBPs as (string | number)[], 
        rewarders as string[], 
        withPoolUpdate, 
        syncFixedPercentageFarms
    );
}

(async function () {
    try {
        // Setup
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAdminV2Address = addressList.bsc.MASTER_APE_ADMIN_V2;
        const timelockGeneral = addressList.bsc.OZ_TIMELOCK_GENERAL;
        const TIMELOCK_DELAY = addressList.bsc.TIMELOCK_DELAY;
        const timelockEncoder = new TimelockEncoder(timelockGeneral);
        const masterApeAdminV2Encoder = new MasterApeAdminV2Encoder(masterApeAdminV2Address);

        // Encode MasterApeAdminV2 Set Transactions
        const encodedTx = await encodeSetTxs(MASTER_APE_V2_ALLOCATIONS, masterApeAdminV2Encoder);
        const encodedTimelockTxs = await timelockEncoder.encodeTxsForSingleOperation({ target: masterApeAdminV2Address, data: encodedTx.data || '0x', salt: salt  }, TIMELOCK_DELAY)
        // Write output
        const fileOutput = await writeJSONToFile('./scripts/encodeMasterApeAdminV2SetTxs.json', {encodedTimelockTxs, encodedTx}, true);
        console.log(`Encoded transaction data has been saved to: ${fileOutput}`);

        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());