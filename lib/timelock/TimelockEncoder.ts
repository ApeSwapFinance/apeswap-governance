import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import TimelockBuild from '../../build/contracts/Timelock.json'
import { Timelock } from '../../types/ethers-contracts/Timelock'
import { BigNumber, utils, BytesLike } from 'ethers';
import { ADDRESS_0, BYTES_32_0 } from '../constants'

const abiCoder = utils.defaultAbiCoder;
const keccak256 = utils.keccak256;

interface SingleOperation {
    target: string;
    value?: string | BigNumber;
    data: string;
    predecessor?: BytesLike;
    salt?: BytesLike;
}

interface BatchOperation {
    targets: string[];
    values: Array<string | BigNumber>;
    datas: string[];
    predecessor?: BytesLike;
    salt?: BytesLike;
}

interface EncodeReturn {
    populatedTx: PopulatedTransaction;
    data: string;
    operationId: string;
}

export interface BatchEncodeReturn {
    scheduleBatchEncoded: PopulatedTransaction,
    executeBatchEncoded: PopulatedTransaction,
    cancelBatchEncoded: PopulatedTransaction,
    operationId: string
}


export default class TimelockEncoder {
    timelockContract: Timelock;

    constructor(address = ADDRESS_0) {
        this.timelockContract = new Contract(address, TimelockBuild.abi) as Timelock;
    }

    async encodeCancelOperation(operationId: string): Promise<PopulatedTransaction> {
        return await this.timelockContract.populateTransaction.cancel(operationId);
    }

    /**
     * Single TX handling
     */
    async encodeTxsForSingleOperation({ target, value = '0', data, predecessor = BYTES_32_0, salt = BYTES_32_0 }: SingleOperation, delay: string | number): Promise<{ scheduleEncoded: PopulatedTransaction, executeEncoded: PopulatedTransaction, cancelEncoded: PopulatedTransaction, operationId: string }> {
        const { populatedTx: scheduleEncoded, operationId } = await this.encodeSchedule({ target, value, data, predecessor, salt }, delay);
        const { populatedTx: executeEncoded, } = await this.encodeExecute({ target, value, data, predecessor, salt });
        const cancelEncoded = await this.encodeCancelOperation(operationId);

        return { scheduleEncoded, executeEncoded, cancelEncoded, operationId }

    }

    async hashOperation({ target, value = '0', data, predecessor = BYTES_32_0, salt = BYTES_32_0 }: SingleOperation): Promise<string> {
        const abiEncoded = abiCoder.encode(
            ["address", "uint256", "bytes", "bytes32", "bytes32"],
            [target, value, data, predecessor, salt]
        );
        const operationId = keccak256(abiEncoded);
        return operationId;
    }

    async encodeSchedule({ target, value = '0', data, predecessor = BYTES_32_0, salt = BYTES_32_0 }: SingleOperation, delay: string | number): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.schedule(target, value, data, predecessor, salt, delay);
        const operationId = await this.hashOperation({ target, value, data, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

    async encodeExecute({ target, value = '0', data, predecessor = BYTES_32_0, salt = BYTES_32_0 }: SingleOperation): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.execute(target, value, data, predecessor, salt);
        const operationId = await this.hashOperation({ target, value, data, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }


    /**
     * Batch TX handling
     */
    async encodeTxsForBatchOperation({ targets, values, datas, predecessor = BYTES_32_0, salt = BYTES_32_0 }: BatchOperation, delay: string | number): Promise<BatchEncodeReturn> {
        const { populatedTx: scheduleBatchEncoded, operationId } = await this.encodeScheduleBatch({ targets, values, datas, predecessor, salt }, delay);
        const { populatedTx: executeBatchEncoded, } = await this.encodeExecuteBatch({ targets, values, datas, predecessor, salt });
        const cancelBatchEncoded = await this.encodeCancelOperation(operationId);

        return { scheduleBatchEncoded, executeBatchEncoded, cancelBatchEncoded, operationId }

    }

    async hashOperationBatch({ targets, values, datas, predecessor = BYTES_32_0, salt = BYTES_32_0 }: BatchOperation): Promise<string> {
        const abiEncoded = abiCoder.encode(
            ["address[]", "uint256[]", "bytes[]", "bytes32", "bytes32"],
            [targets, values, datas, predecessor, salt]
        );
        const operationId = keccak256(abiEncoded);
        return operationId;
    }
    async encodeScheduleBatch({ targets, values, datas, predecessor = BYTES_32_0, salt = BYTES_32_0 }: BatchOperation, delay: string | number): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.scheduleBatch(targets, values, datas, predecessor, salt, delay);
        const operationId = await this.hashOperationBatch({ targets, values, datas, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

    async encodeExecuteBatch({ targets, values, datas, predecessor = BYTES_32_0, salt = BYTES_32_0 }: BatchOperation): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.executeBatch(targets, values, datas, predecessor, salt);
        const operationId = await this.hashOperationBatch({ targets, values, datas, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

}
