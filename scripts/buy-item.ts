import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { NftMarketplace, BasicNft } from "../typechain-types";

const TOKEN_ID = 0;
const SLEEP_AMOUNT = 1000;

const buyItem = async () => {
  const nftMarketplace: NftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft: BasicNft = await ethers.getContract("BasicNft");
  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
  const price = listing.price.toString();
  const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price });
  await tx.wait(1);
  console.log("NFT Bought!");
  if (network.config.chainId === 31337) {
    await moveBlocks(2, SLEEP_AMOUNT);
  }
};

buyItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
