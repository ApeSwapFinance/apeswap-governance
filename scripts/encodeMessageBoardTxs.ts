import { BigNumber, utils } from 'ethers';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts'

import MessageBoardBuild from '../build/contracts/MessageBoard.json'
import { MessageBoard } from '../types/ethers-contracts/MessageBoard'

import { ADDRESS_0, BYTES_32_0 } from '../lib/constants/'
import { addressList } from '../lib/constants/addressList';
import TimelockEncoder, { BatchEncodeReturn } from '../lib/timelock/TimelockEncoder';


async function encodeMessageTx(message: string, { address = ADDRESS_0 }): Promise<PopulatedTransaction> {
    const messageBoardContract = new Contract(address, MessageBoardBuild.abi) as MessageBoard;
    const populatedTx = await messageBoardContract.populateTransaction.addMessage(message);
    return populatedTx;
}

async function encodeBatchTimelockMessageTx(messages: string[], { timelockAddress = ADDRESS_0, messageBoardAddress = ADDRESS_0, predecessor = BYTES_32_0, salt = BYTES_32_0, delay = 20 }): Promise<BatchEncodeReturn> {
    const timelockEncoder = new TimelockEncoder(timelockAddress);

    const targets: string[] = [];
    const datas: string[] = [];
    const values: string[] = [];
    for (const message of messages) {
        const populatedTx = await encodeMessageTx(message, { address: messageBoardAddress });
        targets.push(populatedTx.to || '0x');
        datas.push(populatedTx.data || '0x');
        values.push('0');
    }

    return await timelockEncoder.encodeTxsForBatchOperation({ targets, values, datas, predecessor, salt }, delay);
};


(async function () {
    try {
        // TODO: dynamic code
        const messages = ['DeFi Apes', 'We love $BANANA', 'But also love to burn $BANANA'];
        const messageBoardAddress = addressList[56].MESSAGE_BOARD;
        const timelockAddress = addressList[56].OZ_TIMELOCK_ALPHA;
        const encodeReturn = await encodeBatchTimelockMessageTx(messages, { messageBoardAddress, timelockAddress });
        console.dir(encodeReturn);
        process.exit(0); // Exit Success
    } catch (e: any) {
        throw new Error(e);
    }
}());

