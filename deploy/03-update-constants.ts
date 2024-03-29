import "dotenv/config";
import { contractsAddressesFile, contractsAbisFile } from "../helper-hardhat-config";
import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbis();
    console.log("Front end written!");
  }
};

// Perhaps contract's ABI should be an npm package to be shared with multiple repos
const updateAbis = async () => {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  writeFileSync(
    `${contractsAbisFile}NftMarketplace.json`,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json) as string,
  );

  const basicNft = await ethers.getContract("BasicNft");
  writeFileSync(
    `${contractsAbisFile}BasicNft.json`,
    basicNft.interface.format(ethers.utils.FormatTypes.json) as string,
  );

  const setQuote = await ethers.getContract("SetQuote");
  writeFileSync(
    `${contractsAbisFile}SetQuote.json`,
    setQuote.interface.format(ethers.utils.FormatTypes.json) as string,
  );
};

const updateContractAddresses = async () => {
  const chainId = network.config.chainId.toString();
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");
  const setQuote = await ethers.getContract("SetQuote");
  const contractAddresses = JSON.parse(readFileSync(contractsAddressesFile, "utf8"));
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
      contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
    }
    if (!contractAddresses[chainId]["BasicNft"]?.includes(basicNft.address)) {
      contractAddresses[chainId]["BasicNft"].push(basicNft.address);
    }
    if (!contractAddresses[chainId]["SetQuote"]?.includes(setQuote.address)) {
      contractAddresses[chainId]["SetQuote"].push(setQuote.address);
    }
  } else {
    contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
    contractAddresses[chainId] = { BasicNft: [basicNft.address] };
    contractAddresses[chainId] = { SetQuote: [setQuote.address] };
  }
  writeFileSync(contractsAddressesFile, JSON.stringify(contractAddresses));
};
module.exports.tags = ["all", "constants"];
