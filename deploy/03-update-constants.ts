import { contractsAddressesFile } from "../helper-hardhat-config";
import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    // await updateAbi()
    console.log("Front end written!");
  }
};

async function updateContractAddresses() {
  const chainId = network.config.chainId.toString();
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const contractAddresses = JSON.parse(readFileSync(contractsAddressesFile, "utf8"));
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
      contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
  }
  writeFileSync(contractsAddressesFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "constants"];
