import { BYTES_32_0, BYTES_32 } from '../lib/constants'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminEncoder from '../lib/master-ape/MasterApeAdminEncoder';

(async function () {
    try {
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAdminAddress = addressList[56].MASTER_APE_ADMIN_DUMMY;
        // NOTE: Mainnet test OZ timelock owner of MasterApeAdmin Dummy
        // MasterApeAdmin Owner address (can set pending owner of MasterApe)
        const timelockAddress = addressList[56].OZ_TIMELOCK_BRAVO;
        // NOTE: Set delay based on timelock settings
        const TIMELOCK_DELAY = 3600 * 6 // 20 for dummy contracts
        const pendingOwner = addressList[56].GENERAL_ADMIN_EOA;
        const timelockEncoder = new TimelockEncoder(timelockAddress);
        const masterApeAdminEncoder = new MasterApeAdminEncoder(masterApeAdminAddress);
        // 1. Set pending owner
        const setPendingOwnerEncoded = await masterApeAdminEncoder.encodeSetPendingMasterApeOwner(pendingOwner);
        const setPendingOwnerTimelockEncoded = await timelockEncoder.encodeTxsForSingleOperation(
            { 
                target: masterApeAdminAddress, 
                value: '0', 
                data: setPendingOwnerEncoded.data || '0x', 
                predecessor: BYTES_32_0, 
                salt: salt  
            }, 
            TIMELOCK_DELAY
            )
        // 2. Accept pending owner
        const acceptMasterApeOwnership = await masterApeAdminEncoder.encodeAcceptMasterApeOwnership();
        const acceptMasterApeOwnershipTimelockEncoded = await timelockEncoder.encodeTxsForSingleOperation(
            { 
                target: masterApeAdminAddress, 
                value: '0', 
                data: acceptMasterApeOwnership.data || '0x', 
                predecessor: BYTES_32_0, 
                salt: salt  
            }, 
            TIMELOCK_DELAY
        )

        console.dir({SetPendingOwnerTimelockEncoded: setPendingOwnerTimelockEncoded, AcceptMasterApeOwnershipTimelockEncoded: acceptMasterApeOwnershipTimelockEncoded}, { depth: 5 });
        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());