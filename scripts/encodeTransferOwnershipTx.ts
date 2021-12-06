import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import MasterApeBuild from '../build-apeswap/contracts/MasterApe.json'
import { MasterApe } from '../types/ethers-contracts/MasterApe' 
import { ADDRESS_0, BYTES_32_0, BYTES_32 } from '../lib/constants/'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder from '../lib/timelock/TimelockEncoder';

async function encodeMasterApeTransferOwnershipTx(newOwner: string, { address = ADDRESS_0 }): Promise<PopulatedTransaction> {
    const masterApeContract = new Contract(address, MasterApeBuild.abi) as MasterApe;
    const populatedTx = await masterApeContract.populateTransaction.transferOwnership(newOwner);
    return populatedTx;
}


(async function () {
    try {
        const salt = BYTES_32(String(Math.floor(Math.random() * 100000) + 1));
        const masterApeAddress = addressList[56].MASTER_APE_DUMMY;
        const masterApeAdminAddress = addressList[56].MASTER_APE_ADMIN_DUMMY;
        const timelockAddress = addressList[56].OZ_TIMELOCK_ALPHA;
        const timelockEncoder = new TimelockEncoder(timelockAddress);

        const encodedTx = await encodeMasterApeTransferOwnershipTx(masterApeAdminAddress, { address: masterApeAddress });
        const timelockEncoded = await timelockEncoder.encodeTxsForSingleOperation({ target: masterApeAddress, value: '0', data: encodedTx.data || '0x', predecessor: BYTES_32_0, salt: salt  }, 20)

        console.dir({TimelockEncoded: timelockEncoded, MasterApeEncoded: encodedTx}, { depth: 5 });
        process.exit(0); // Exit Success
    } catch (e) {
        throw new Error(e);
    }
}());