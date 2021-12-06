const MessageBoard = artifacts.require("MessageBoard");

const { getDeployConfig } = require("../deploy-config");


module.exports = async function (deployer, network, accounts) {
  const [ deployerAccount ] = accounts;
  const { admin } = getDeployConfig(network, accounts);

  // Deploy MessageBoard
  await deployer.deploy(MessageBoard, {from: deployerAccount});
  const messageBoard = await MessageBoard.at(MessageBoard.address);

  await messageBoard.transferOwnership(admin);

  const adminOfContract = await messageBoard.owner();
  // Log/verify results
  console.dir({
    messageBoard: messageBoard.address,
    adminOfContract
  })
};
