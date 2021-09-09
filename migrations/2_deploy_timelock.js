
const Timelock = artifacts.require("Timelock");


module.exports = async function (deployer, network, accounts) {
  // TODO: Configure 
  const minDelay = 10;
  const proposers = [accounts[1]];
  const executors = [accounts[1]];
  await deployer.deploy(Timelock, minDelay, proposers, executors);
};
