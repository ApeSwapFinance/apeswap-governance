import { Contract, PopulatedTransaction } from '@ethersproject/contracts'

import MasterApeBuild from '../build-apeswap/contracts/MasterApe.json'
import { MasterApe } from '../types/ethers-contracts/MasterApe'

import { ADDRESS_0, BYTES_32_0 } from '../lib/constants/'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder, { BatchEncodeReturn } from '../lib/timelock/TimelockEncoder';

async function encodeMasterApeAddTx(allocation: number, stakeTokenAddress: string, { address = ADDRESS_0, withUpdate = false }): Promise<PopulatedTransaction> {
    const masterApeContract = new Contract(address, MasterApeBuild.abi) as MasterApe;
    // add(uint256 _allocPoint, IBEP20 _lpToken, bool _withUpdate)
    const populatedTx = await masterApeContract.populateTransaction.add(allocation, stakeTokenAddress, withUpdate);
    return populatedTx;
}

interface AddFarm {
    allocation: number;
    stakeTokenAddress: string;
    withUpdate: boolean;
}

async function encodeBatchTimelockMasterApeAddTxs(adds: AddFarm[], { timelockAddress = ADDRESS_0, masterApeAddress = ADDRESS_0, predecessor = BYTES_32_0, salt = BYTES_32_0, delay = 20 }): Promise<BatchEncodeReturn> {
    const timelockEncoder = new TimelockEncoder(timelockAddress);

    const targets: string[] = [];
    const datas: string[] = [];
    const values: string[] = [];
    for (const add of adds) {
        const populatedTx = await encodeMasterApeAddTx(add.allocation, add.stakeTokenAddress, { address: masterApeAddress, withUpdate: add.withUpdate });
        targets.push(populatedTx.to || '0x');
        datas.push(populatedTx.data || '0x');
        values.push('0');
    }

    return await timelockEncoder.encodeTxsForBatchOperation({ targets, values, datas, predecessor, salt }, delay);
};


async function encodeMasterApeSetTx(pid: number, allocation: number, { address = ADDRESS_0, withUpdate = false }): Promise<PopulatedTransaction> {
    const masterApeContract = new Contract(address, MasterApeBuild.abi);
    // set(uint256 _pid, uint256 _allocPoint, bool _withUpdate)
    const populatedTx = await masterApeContract.populateTransaction.set(pid, allocation, withUpdate);
    return populatedTx;
}

interface SetFarm {
    pid: number;
    allocation: number;
    withUpdate: boolean;
}

async function encodeBatchTimelockMasterApeSetTxs(sets: SetFarm[], { timelockAddress = ADDRESS_0, masterApeAddress = ADDRESS_0, predecessor = BYTES_32_0, salt = BYTES_32_0, delay = 20 }): Promise<BatchEncodeReturn> {
    const timelockEncoder = new TimelockEncoder(timelockAddress);

    const targets: string[] = [];
    const datas: string[] = [];
    const values: string[] = [];
    for (const set of sets) {
        const populatedTx = await encodeMasterApeSetTx(set.pid, set.allocation, { address: masterApeAddress, withUpdate: set.withUpdate });
        targets.push(populatedTx.to || '0x');
        datas.push(populatedTx.data || '0x');
        values.push('0');
    }

    return await timelockEncoder.encodeTxsForBatchOperation({ targets, values, datas, predecessor, salt }, delay);
};


(async function () {
    try {
        // NOTE: dynamic code
        const masterApeAddress = addressList[56].MASTER_APE_DUMMY;
        const timelockAddress = addressList[56].OZ_TIMELOCK_ALPHA;

        // Adds
        // const adds: AddFarm[] = [
        //     {
        //         allocation: 99,
        //         stakeTokenAddress: '0x13F8076628A2a475Cf190D2b31a78118a00b2FFE', // Farmy Farm
        //         withUpdate: true,
        //     },
        //     {
        //         allocation: 100,
        //         stakeTokenAddress: '0x32C9bE8713f02EE38AC2a2f02EA8af9cC0C5064B', // Happy Farm
        //         withUpdate: true,
        //     },
        //     {
        //         allocation: 101,
        //         stakeTokenAddress: '0xf89713800fe2c5d3ef5e5bc5bef01fd1fbf3518a', // Sad Farm
        //         withUpdate: true,
        //     }
        // ];
        // const encodeReturn = await encodeBatchTimelockMasterApeAddTxs(adds, { masterApeAddress, timelockAddress });

        // Adds
        const sets: SetFarm[] = [
            {
                pid: 1, // Farmy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 1, // Farmy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 1, // Farmy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 1, // Farmy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 1, // Farmy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 10,
                withUpdate: true,
            },
            {
                pid: 1, // Farmy Farm
                allocation: 199,
                withUpdate: true,
            },
            {
                pid: 2, // Happy Farm
                allocation: 200,
                withUpdate: true,
            },
            {
                pid: 3, // Sad Farm
                allocation: 201,
                withUpdate: true,
            },
        ];


        const encodeReturn = await encodeBatchTimelockMasterApeSetTxs(sets, { masterApeAddress, timelockAddress });

        console.dir(encodeReturn);
        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());

