import { run } from "hardhat";
import { Addresses } from "../common";

const main = async () => {
  const addresses = Addresses()!;

  await run("verify:verify", {
    address: addresses.SeamoonProtocol,
    constructorArguments: [],
  }).catch((err) => {
    console.error(err);
  });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
