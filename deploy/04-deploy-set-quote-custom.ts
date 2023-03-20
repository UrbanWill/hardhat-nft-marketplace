import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deploySetQuote: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const args = [];
  const setQuote = await deploy("SetQuote", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    console.log("setQuote.address", setQuote.address);
    console.log("args", args);
    await verify(setQuote.address, args);
  }
  log("----------------------------------------------------");
};

deploySetQuote.tags = ["all", "setquote"];

export default deploySetQuote;
