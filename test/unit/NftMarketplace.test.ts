import { developmentChains } from "../../helper-hardhat-config";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", () => {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;
      let accounts: SignerWithAddress;
      let deployer: SignerWithAddress;
      let user: SignerWithAddress;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract("BasicNft");
        basicNft = await basicNftContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
      });

      describe("listItem", () => {
        it("emits an event after listing an item", async () => {
          expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
            "ItemListed",
          );
        });
        it("exclusively items that haven't been listed", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE),
          ).to.be.revertedWith(error);
        });
        it("exclusively allows owners to list", async () => {
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE),
          ).to.be.revertedWith("NotOwner");
        });
        it("needs approvals to list item", async () => {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE),
          ).to.be.revertedWith("NotApprovedForMarketplace");
        });
        it("Updates listing with seller and price", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });
      });

      describe("cancelListing", () => {
        it("reverts if there is no listing", async () => {
          const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.be.revertedWith(
            error,
          );
        });
        it("reverts if anyone but the owner tries to call", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.be.revertedWith(
            "NotOwner",
          );
        });
        it("emits event and removes listing", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(
            "ItemCanceled",
          );
          const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
          assert(listing.price.toString() == "0");
        });
      });

      describe("buyItem", () => {
        it("reverts if the item isnt listed", async () => {
          await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith(
            "NotListed",
          );
        });
        it("reverts if the price isnt met", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith(
            "PriceNotMet",
          );
        });
        it("transfers the nft to the buyer and updates internal proceeds record", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          expect(
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE }),
          ).to.emit("ItemBought");
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketplace.getProceeds(deployer.address);
          assert(newOwner.toString() == user.address);
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });

      describe("updateListing", () => {
        it("must be owner and listed", async () => {
          await expect(
            nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE),
          ).to.be.revertedWith("NotListed");
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE),
          ).to.be.revertedWith("NotOwner");
        });
        it("updates the price of the item", async () => {
          const updatedPrice = ethers.utils.parseEther("0.2");
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice),
          ).to.emit("ItemListed");
          const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
          assert(listing.price.toString() == updatedPrice.toString());
        });
      });

      describe("withdrawProceeds", () => {
        it("doesn't allow 0 proceed withdrawls", async () => {
          await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith("NoProceeds");
        });
        it("withdraws proceeds", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
          nftMarketplace = nftMarketplaceContract.connect(deployer);

          const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address);
          const deployerBalanceBefore = await deployer.getBalance();
          const txResponse = await nftMarketplace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const deployerBalanceAfter = await deployer.getBalance();

          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString(),
          );
        });
      });
    });
