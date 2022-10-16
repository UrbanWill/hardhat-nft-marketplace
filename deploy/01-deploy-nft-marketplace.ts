import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployNftMarketplace: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const args = [];
  const nftMarketplace = await deploy("NftMarketplace", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(nftMarketplace.address, args);
  }
  log("----------------------------------------------------");
};

deployNftMarketplace.tags = ["all", "nftmarketplace"];

export default deployNftMarketplace;
