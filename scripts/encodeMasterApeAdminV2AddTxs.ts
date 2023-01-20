import { writeJSONToFile } from '@defifofum/files'

import { ADDRESS_0, BYTES_32 } from '../lib/constants'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminV2Encoder from '../lib/master-ape/MasterApeAdminV2Encoder';

import MASTER_APE_V2_NEW_FARMS from './inputs/MASTER_APE_V2_NEW_FARMS.json'

interface AddInput {
    lpToken: string
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
 *      "lpTokens": string,
 *      "allocation": number | string,
 *      "depositFeesBP"?: number | string,
 *      "rewarder"?: string,
 * }]
 */
async function encodeAddTxs(
    addAllocations: AddInput[],
    masterApeAdminV2Encoder: MasterApeAdminV2Encoder,
    options?: {
        withPoolUpdate?: boolean
        syncFixedPercentageFarms?: boolean
    }
) {
    const withPoolUpdate = options?.withPoolUpdate || true
    const syncFixedPercentageFarms = options?.syncFixedPercentageFarms || true

    const lpTokens = addAllocations.map(value => value.lpToken);
    const addAllocationsPoints = addAllocations.map(value => value.allocation);
    if(lpTokens.length != addAllocationsPoints.length) {
        throw new Error(`allocations array mismatch!`)
    }

    /**
     * Configure optional params
     */
    const depositFeesBPs = addAllocations.map(value => value.depositFeesBP || 0);
    const rewarders = addAllocations.map(value => value.rewarder || ADDRESS_0);

    return masterApeAdminV2Encoder.encodeAddMasterApeFarms(
        addAllocationsPoints, 
        lpTokens, 
        depositFeesBPs, 
        rewarders, 
        withPoolUpdate, 
        syncFixedPercentageFarms
    );
}

(async function () {
    try {
        // Setup
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAdminAddress = addressList[56].MASTER_APE_ADMIN_V2_DUMMY;
        const timelockAlphaAddress = addressList[56].OZ_TIMELOCK_ALPHA;
        const timelockEncoder = new TimelockEncoder(timelockAlphaAddress);
        const TIMELOCK_DELAY = 20;
        const masterApeAdminV2Encoder = new MasterApeAdminV2Encoder(masterApeAdminAddress);

        // Encode MasterApeAdminV2 Set Transactions
        const encodedTx = await encodeAddTxs(MASTER_APE_V2_NEW_FARMS, masterApeAdminV2Encoder);
        const encodedTimelockTxs = await timelockEncoder.encodeTxsForSingleOperation({ target: masterApeAdminAddress, data: encodedTx.data || '0x', salt: salt  }, TIMELOCK_DELAY)
        // Write output
        const fileOutput = await writeJSONToFile('./scripts/encodeMasterApeAdminV2AddTxs.json', {encodedTimelockTxs, encodedTx}, true);
        console.log(`Encoded transaction data has been saved to: ${fileOutput}`);

        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());