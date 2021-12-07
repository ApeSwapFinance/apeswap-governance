import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/abstract-provider'
import TimelockBuild from '../../build/contracts/Timelock.json'
import { Timelock } from '../../types/ethers-contracts/Timelock'
import { BigNumber, utils, BytesLike, Signer } from 'ethers';
import { ADDRESS_0 } from '../constants'
import { TypedEventFilter } from '../../types/ethers-contracts/commons';

const abiCoder = utils.defaultAbiCoder;
const keccak256 = utils.keccak256;



export default class TimelockEventManager {
    timelockContract: Timelock;

    constructor(address: string, signerOrProvider: Signer | Provider) {
        this.timelockContract = new Contract(address, TimelockBuild.abi, signerOrProvider) as Timelock;
    }

    async getCallScheduledEvents({ fromBlock = 0, toBlock = 'latest' }: { fromBlock?: number; toBlock?: number | string }): Promise<TypedEventFilter<[string, BigNumber, string, BigNumber, string, string, BigNumber],
        {
            id: string;
            index: BigNumber;
            target: string;
            value: BigNumber;
            data: string;
            predecessor: string;
            delay: BigNumber;
        }>> {
        return await this.timelockContract.queryFilter(this.timelockContract.filters.CallScheduled(), fromBlock, toBlock) as any;
    }

}
