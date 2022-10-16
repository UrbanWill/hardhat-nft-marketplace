const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
import { NftMarketplace, BasicNft } from "../typechain-types";

const TOKEN_ID = 0;

const cancelItem = async () => {
  const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft: BasicNft = await ethers.getContract("BasicNft");
  const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
  await tx.wait(1);
  console.log("NFT Canceled!");
  if (network.config.chainId == "31337") {
    await moveBlocks(2, 1000);
  }
};

cancelItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
