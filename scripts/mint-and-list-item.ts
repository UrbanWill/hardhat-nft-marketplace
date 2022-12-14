import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { NftMarketplace, BasicNft } from "../typechain-types";

const PRICE = ethers.utils.parseEther("0.1");
const sleepAmount: number = 1000;

const mintAndList = async () => {
  const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft: BasicNft = await ethers.getContract("BasicNft");

  console.log("Minting NFT...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log("Approving NFT...");
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log(`NFT Listed with id ${tokenId}`);
  if (network.config.chainId === 31337) {
    await moveBlocks(1, sleepAmount);
  }
};

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
