import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import Timelock from '../build/contracts/Timelock.json'
import { BigNumber, utils } from 'ethers';

const abiCoder = utils.defaultAbiCoder;
const keccak256 = utils.keccak256;

const ADDRESS_0 = '0x0000000000000000000000000000000000000001'

interface SingleOperation {
    target: string;
    value: string | BigNumber;
    data: string;
    predecessor: string | BigNumber;
    salt: string | BigNumber;
}

interface BatchOperation {
    targets: string[];
    values: Array<string | BigNumber>;
    datas: string[];
    predecessor: Array<string | BigNumber>;
    salt: Array<string | BigNumber>;
}

interface EncodeReturn {
    populatedTx: PopulatedTransaction;
    data: string;
    operationId: string;
}


export default class TimelockEncoder {
    timelockContract: Contract;

    constructor(address = ADDRESS_0) {
        this.timelockContract = new Contract(address, Timelock.abi);;
    }

    async encodeCancelOperation(operationId: string): Promise<PopulatedTransaction> {
        return await this.timelockContract.populateTransaction.cancel(operationId);
    }

    /**
     * Single TX handling
     */
    async encodeTxsForSingleOperation({ target, value, data, predecessor, salt }: SingleOperation, delay: string | number): Promise<{ scheduleEncoded: PopulatedTransaction, executeEncoded: PopulatedTransaction, cancelEncoded: PopulatedTransaction, operationId: string }> {
        const { populatedTx: scheduleEncoded, operationId } = await this.encodeSchedule({ target, value, data, predecessor, salt }, delay);
        const { populatedTx: executeEncoded, } = await this.encodeExecute({ target, value, data, predecessor, salt });
        const cancelEncoded = await this.encodeCancelOperation(operationId);

        return { scheduleEncoded, executeEncoded, cancelEncoded, operationId }

    }

    async hashOperation({ target, value, data, predecessor, salt }: SingleOperation): Promise<string> {
        const abiEncoded = abiCoder.encode(
            ["address", "uint256", "bytes", "bytes32", "bytes32"],
            [target, value, data, predecessor, salt]
        );
        const operationId = keccak256(abiEncoded);
        return operationId;
    }

    async encodeSchedule({ target, value, data, predecessor, salt }: SingleOperation, delay: string | number): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.schedule(target, value, data, predecessor, salt, delay);
        const operationId = await this.hashOperation({ target, value, data, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

    async encodeExecute({ target, value, data, predecessor, salt }: SingleOperation): Promise<EncodeReturn> {
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
    async encodeTxsForBatchOperation({ targets, values, datas, predecessor, salt }: BatchOperation, delay: string | number): Promise<{ scheduleBatchEncoded: PopulatedTransaction, executeBatchEncoded: PopulatedTransaction, cancelBatchEncoded: PopulatedTransaction, operationId: string }> {
        const { populatedTx: scheduleBatchEncoded, operationId } = await this.encodeScheduleBatch({ targets, values, datas, predecessor, salt }, delay);
        const { populatedTx: executeBatchEncoded, } = await this.encodeExecuteBatch({ targets, values, datas, predecessor, salt });
        const cancelBatchEncoded = await this.encodeCancelOperation(operationId);

        return { scheduleBatchEncoded, executeBatchEncoded, cancelBatchEncoded, operationId }

    }

    async hashOperationBatch({ targets, values, datas, predecessor, salt }: BatchOperation): Promise<string> {
        const abiEncoded = abiCoder.encode(
            ["address[]", "uint256[]", "bytes[]", "bytes32", "bytes32"],
            [targets, values, datas, predecessor, salt]
        );
        const operationId = keccak256(abiEncoded);
        return operationId;
    }
    async encodeScheduleBatch({ targets, values, datas, predecessor, salt }: BatchOperation, delay: string | number): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.scheduleBatch(targets, values, datas, predecessor, salt, delay);
        const operationId = await this.hashOperationBatch({ targets, values, datas, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

    async encodeExecuteBatch({ targets, values, datas, predecessor, salt }: BatchOperation): Promise<EncodeReturn> {
        const populatedTx = await this.timelockContract.populateTransaction.executeBatch(targets, values, datas, predecessor, salt);
        const operationId = await this.hashOperationBatch({ targets, values, datas, predecessor, salt });
        return {
            populatedTx,
            data: populatedTx.data || '0x',
            operationId
        }
    }

}
