import { writeJSONToFile } from './lib/files'

import { BYTES_32 } from '../lib/constants/'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminEncoder from '../lib/timelock/MasterApeAdminEncoder';

import { farmDetails } from './farmsToAdd'

(async function () {
    try {
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAdminAddress = addressList[56].MASTER_APE_ADMIN_DUMMY;
        const timelockAlphaAddress = addressList[56].OZ_TIMELOCK_ALPHA;
        const timelockEncoder = new TimelockEncoder(timelockAlphaAddress);
        const masterApeAdminEncoder = new MasterApeAdminEncoder(masterApeAdminAddress);

        // TODO: dynamic code
        // NOTE: Ownership transfer
        // const encodedTxToSend = await masterApeAdminEncoder.encodeSetPendingMasterApeOwner(timelockAlphaAddress);
        // const encodedTxToSend = await masterApeAdminEncoder.encodeAcceptMasterApeOwnership();
        // NOTE: Fixed Percentage Farms
        // const encodedTxToSend = await masterApeAdminEncoder.encodeAddFixedPercentFarmAllocation(1, 1000, true, true);
        // const encodedTxToSend1 = await masterApeAdminEncoder.encodeAddFixedPercentFarmAllocation(2, 100, true, true);
        // const encodedTxToSend2 = await masterApeAdminEncoder.encodeAddFixedPercentFarmAllocation(3, 100, true, true);
        // NOTE: MasterApe Farms
        // const encodedTxToSend = await masterApeAdminEncoder.encodeSetMasterApeFarms([2,3], [1000, 2000], true);
        // const encodedTxToSend = await masterApeAdminEncoder.encodeSyncFixedPercentFarms();

        let allocationsPoints: number[] = [];
        let lpTokens: string[] = [];
        for (let index = farmDetails.length -1 ; index >= 0; index--) {
            const [lpToken, allocationPoint] = farmDetails[index];
            allocationsPoints.push(allocationPoint);
            lpTokens.push(lpToken);
            // NOTE: Limiting the number here
            if(allocationsPoints.length >= 20) {
                break;
            }
        }
        // NOTE: Seem to be able to add up to 20 pools without updates
        // NOTE: The massPoolUpdate and syncFixedPercentage farm updates can be done in separate txs 
        // const encodedTxToSend = await masterApeAdminEncoder.encodeAddMasterApeFarms(allocationsPoints, lpTokens, false, true);


        let setAllocationsPoints: number[] = [];
        let pids: number[] = [];
        for (let pid = 31 ; pid <= 81; pid++) {
            pids.push(pid);
            setAllocationsPoints.push(111)
        }
        const encodedTxToSend = await masterApeAdminEncoder.encodeSetMasterApeFarms(pids, setAllocationsPoints, false, true);

        const encodedTimelockTxs = await timelockEncoder.encodeTxsForSingleOperation({ target: masterApeAdminAddress, data: encodedTxToSend.data || '0x', salt: salt  }, 20)
        console.dir({TimelockEncoded: encodedTimelockTxs, encodedTxToSend}, { depth: 5 });
        await writeJSONToFile('./scripts/encodeMasterApeAdminTxs.json', {encodedTimelockTxs, encodedTxToSend});

        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());