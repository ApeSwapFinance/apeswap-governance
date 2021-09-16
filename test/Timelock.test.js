const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const { farm, dex } = require('@apeswapfinance/test-helpers');
const { expect, assert } = require('chai');

const Timelock = contract.fromArtifact('Timelock');

function encodeContractFunction(ozContract, method, args = []) {
  // https://web3js.readthedocs.io/en/v3.0.0-rc.5/web3-eth-contract.html#methods-mymethod-encodeabi
  // myContract.methods.myMethod(123).encodeABI();
  // @openzeppelin/test-environment stores the web3 contract under t
  return ozContract.contract.methods[method](...args).encodeABI()

}


describe('Timelock', async function () {
  this.timeout(10000);
  const [owner, feeTo, alice, bob, carol, proposerOne, proposerTwo, executorOne, executorTwo] = accounts;

  describe('Farm Reorganization', async function () {

    before(async () => {
      this.NUM_POOLS = 6;

      const {
        //   bananaToken,
        //   bananaSplitBar,
        masterApe,
      } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
      this.masterApe = masterApe;

      const {
        dexFactory,
        mockWBNB,
        mockTokens,
        dexPairs,
      } = await dex.deployMockDex(accounts, this.NUM_POOLS - 1);
      await farm.addPoolsToFarm([owner], this.masterApe, dexPairs);
      // constructor(uint256 minDelay, address[] memory proposers, address[] memory executors)
      this.proposers = [proposerOne, proposerTwo]
      this.executors = [executorOne, executorTwo]
      this.timelock = await Timelock.new(10, this.proposers, this.executors, { from: owner });
    });

    it('should set masterape admin to timelock', async () => {
      await this.masterApe.transferOwnership(this.timelock.address, { from: owner })
      assert.equal(await this.masterApe.owner(), this.timelock.address);
    });

    it('should schedule and execute one masterape update', async () => {
      const NEW_ALLOC = '213'

      // function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) 
      const setEncoded = encodeContractFunction(this.masterApe, 'set', [1, NEW_ALLOC, true]);
      const setTxDetails = [this.masterApe.address, 0, setEncoded, '0x', '0x']

      // Schedule a transaction
      // function schedule(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt, uint256 delay) public virtual onlyRole(PROPOSER_ROLE)
      const scheduleReceipt = await this.timelock.schedule(...setTxDetails, 20, { from: proposerOne })
      /**
       * // TODO: Create a ts event decoder
       * scheduleReceipt.receipt.logs[i].event // event name
       * scheduleReceipt.receipt.logs[i].args[eventArg] // event extract args 
       *  
       */
      // console.dir(scheduleReceipt, { depth: 5})

      await time.increase(30);
      // function execute(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt) public payable virtual onlyRole(EXECUTOR_ROLE)
      await this.timelock.execute(...setTxDetails, { from: executorOne })

      const { allocPoint } = await this.masterApe.poolInfo(1, { from: owner })
      assert.equal(allocPoint.toString(), NEW_ALLOC, 'updated allocation is not accurate')
    });

    it('should schedule and execute a batch of masterape updates', async () => {
      const NEW_ALLOC = '345'
      let targets = [];
      let values = [];
      let datas = [];

      // Exclude pid(0) as it's the base pool
      for (let index = 1; index < this.NUM_POOLS; index++) {
        targets.push(this.masterApe.address);
        values.push('0');
        // function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) 
        const setEncoded = encodeContractFunction(this.masterApe, 'set', [index, NEW_ALLOC, true]);
        datas.push(setEncoded)
      }

      const SALT = '0x0123456789' // TODO: Should be a random number
      const PREDECESSOR = '0x'
      const DELAY = 20 // seconds
      const batchTxDetails = [targets, values, datas, PREDECESSOR, SALT,]

      // Schedule a batch
      // function scheduleBatch(address[] calldata targets, uint256[] calldata values, bytes[] calldata datas, bytes32 predecessor, bytes32 salt, uint256 delay) public virtual onlyRole(PROPOSER_ROLE)
      const scheduleReceipt = await this.timelock.scheduleBatch(...batchTxDetails, DELAY, { from: proposerOne })

      await time.increase(30);
      // function executeBatch(address[] calldata targets, uint256[] calldata values, bytes[] calldata datas, bytes32 predecessor, bytes32 salt) public payable virtual onlyRole(EXECUTOR_ROLE)
      await this.timelock.executeBatch(...batchTxDetails, { from: executorOne })

      // Exclude pid(0) as it's the base pool
      for (let index = 1; index < this.NUM_POOLS; index++) {
        const { allocPoint } = await this.masterApe.poolInfo(index, { from: owner })
        assert.equal(allocPoint.toString(), NEW_ALLOC, 'updated allocation is not accurate')
      }
    });
  });
});
