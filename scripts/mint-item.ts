import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { BasicNft } from "../typechain-types";

const sleepAmount: number = 1000;

const mintItem = async () => {
  const basicNft: BasicNft = await ethers.getContract("BasicNft");

  console.log("Minting NFT...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log(`NFT Minted with id ${tokenId}`);

  if (network.config.chainId === 31337) {
    await moveBlocks(1, sleepAmount);
  }
};

mintItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
