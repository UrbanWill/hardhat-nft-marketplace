const { network } = require("hardhat");

export const sleep = (timeInMs: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
};

export const moveBlocks = async (amount: number, sleepAmount = 0): Promise<void> => {
  console.log("Moving blocks...");
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
    if (sleepAmount) {
      console.log(`Sleeping for ${sleepAmount}`);
      await sleep(sleepAmount);
    }
  }
  console.log(`Moved ${amount} blocks`);
};
