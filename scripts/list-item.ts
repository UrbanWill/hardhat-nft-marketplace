import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { NftMarketplace, BasicNft } from "../typechain-types";

const PRICE = ethers.utils.parseEther("0.1");
const TOKEN_ID = 0;
const sleepAmount: number = 1000;

const listItem = async () => {
  const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft: BasicNft = await ethers.getContract("BasicNft");

  console.log("Approving NFT...");
  const approvalTx = await basicNft.approve(nftMarketplace.address, TOKEN_ID);
  await approvalTx.wait(1);
  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
  await tx.wait(1);
  console.log(`NFT Listed with id ${TOKEN_ID}`);
  if (network.config.chainId === 31337) {
    await moveBlocks(1, sleepAmount);
  }
};

listItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
