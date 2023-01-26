import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import MasterApeBuild from '../build-apeswap/contracts/MasterApe.json'
import { MasterApe } from '../types/ethers-contracts/MasterApe' 
import { ADDRESS_0, BYTES_32_0, BYTES_32 } from '../lib/constants/'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';
import MasterApeAdminEncoder from '../lib/master-ape/MasterApeAdminEncoder'
import { writeJSONToFile } from '@defifofum/files';

async function encodeMasterApeTransferOwnershipTx(newOwner: string, { masterApeAddress = ADDRESS_0 }): Promise<PopulatedTransaction> {
    const masterApeContract = new Contract(masterApeAddress, MasterApeBuild.abi) as MasterApe;
    const populatedTx = await masterApeContract.populateTransaction.transferOwnership(newOwner);
    return populatedTx;
}

(async function () {
    try {
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAddress = addressList.bsc.MASTER_APE;
        const MASTER_APE_ADMIN = addressList.bsc.MASTER_APE_ADMIN;
        const timelockAddress = addressList.bsc.OZ_TIMELOCK_SECURE;
        const timelockDelay = addressList.bsc.TIMELOCK_DELAY;
        const timelockEncoder = new TimelockEncoder(timelockAddress);

        const TARGET_CONTRACT = MASTER_APE_ADMIN;
        const masterApeAdminEncoder = new MasterApeAdminEncoder(TARGET_CONTRACT);
        const encodedTx = await masterApeAdminEncoder.encodeSetPendingMasterApeOwner('0x7b26A27af246b4E482f37eF24e9a3f83c3FC7f1C');


        const encodedTimelockTxs = await timelockEncoder.encodeTxsForSingleOperation({ target: TARGET_CONTRACT, value: '0', data: encodedTx.data || '0x', predecessor: BYTES_32_0, salt: salt  }, timelockDelay)

        const fileOutput = await writeJSONToFile('./scripts/encodeTransferOwnership.json', {encodedTimelockTxs, encodedTx}, true);
        console.log(`Encoded transaction data has been saved to: ${fileOutput}`);

        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());