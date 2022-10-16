import { moveBlocks } from "../utils/move-blocks";

const BLOCKS = 5;

const mine = async (): Promise<void> => {
  await moveBlocks(BLOCKS);
};

mine()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
