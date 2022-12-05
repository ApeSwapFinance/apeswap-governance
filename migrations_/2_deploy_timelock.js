const TimelockControllerEnumerable = artifacts.require("TimelockControllerEnumerable");

const { getDeployConfig } = require("../deploy-config");


module.exports = async function (deployer, network, accounts) {
  const [ deployerAccount ] = accounts;
  const { minDelay, admin, additionalProposers, additionalExecutors } = getDeployConfig(network, accounts);

  // Setup roles
  const proposers = [admin, ...additionalProposers];
  const executors = [admin, ...additionalExecutors];
  // Deploy timelock
  await deployer.deploy(TimelockControllerEnumerable, minDelay, proposers, executors, admin, {from: deployerAccount});
  const timelock = await TimelockControllerEnumerable.at(TimelockControllerEnumerable.address);
  // Transfer ownership to general admin
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  // For `TimelockControllerEnumerable` this is handled in the constructor
  // await timelock.grantRole(TIMELOCK_ADMIN_ROLE, admin, {from: deployerAccount});
  // await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployerAccount, {from: deployerAccount});
  // Verify results
  const adminHasAdminRole = await timelock.hasRole(TIMELOCK_ADMIN_ROLE, admin, {from: deployerAccount});
  const deployerHasAdminRole = await timelock.hasRole(TIMELOCK_ADMIN_ROLE, deployerAccount, {from: deployerAccount});
  const deployerHasProposerRole = await timelock.hasRole(PROPOSER_ROLE, deployerAccount, {from: deployerAccount});
  const deployerHasExecutorRole = await timelock.hasRole(EXECUTOR_ROLE, deployerAccount, {from: deployerAccount});

  // Log/verify results
  console.dir({
    timelock: timelock.address,
    admin,
    adminHasRole: adminHasAdminRole,
    deployerHasAdminRole,
    deployerHasProposerRole,
    deployerHasExecutorRole,
  })
};
