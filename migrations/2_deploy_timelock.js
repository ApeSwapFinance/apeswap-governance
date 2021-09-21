const Timelock = artifacts.require("Timelock");

const { getDeployConfig } = require("../deploy-config");


module.exports = async function (deployer, network, accounts) {
  const [ deployerAccount ] = accounts;
  const { minDelay, admin, additionalProposers, additionalExecutors } = getDeployConfig(network, accounts);

  // Setup roles
  const proposers = [admin, ...additionalProposers];
  const executors = [admin, ...additionalExecutors];
  // Deploy timelock
  await deployer.deploy(Timelock, minDelay, proposers, executors, {from: deployerAccount});
  const timelock = await Timelock.at(Timelock.address);
  // Transfer ownership to general admin
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
  await timelock.grantRole(TIMELOCK_ADMIN_ROLE, admin, {from: deployerAccount});
  await timelock.renounceRole(TIMELOCK_ADMIN_ROLE, deployerAccount, {from: deployerAccount});
  // Verify results
  const adminHasRole = await timelock.hasRole(TIMELOCK_ADMIN_ROLE, admin, {from: deployerAccount});
  const deployerHasRole = await timelock.hasRole(TIMELOCK_ADMIN_ROLE, deployerAccount, {from: deployerAccount});

  // Log/verify results
  console.dir({
    timelock: timelock.address,
    admin,
    adminHasRole,
    deployerHasRole
  })
};
