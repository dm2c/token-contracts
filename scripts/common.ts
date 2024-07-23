import env, { ethers } from "hardhat";
import { KmsProvider, NetworkOptions } from "aws-kms-provider";
import { HttpNetworkConfig } from "hardhat/types";
import Web3 from "web3";
import { string } from "hardhat/internal/core/params/argumentTypes";

export const NilAddress = "0x0000000000000000000000000000000000000000";
const region = process.env.AWS_REGION!;
const keyId = process.env.KMS_KEY_ID!;

interface AddressesType {
  SeamoonProtocol: string;
}

export const address = (name: string): string => {
  const contract = require("./../build/contracts/" + name + ".json");
  const chainid = env.network.config.chainId!.toString();
  return contract["networks"][chainid]["address"] as string;
};

export const abi = (name: string): string => {
  const contract = require("./../build/contracts/" + name + ".json");
  return contract["abi"];
};

export const Addresses = () => {
  switch (env.network.name) {
    case "ropsten":
      return {} as AddressesType;
    case "rinkeby":
      return {} as AddressesType;

    case "goeril":
      return {
        SeamoonProtocol: "",
      } as AddressesType;

    case "mainnet":
      return {
        SeamoonProtocol: "",
      } as AddressesType;

    case "mumbai":
      return {
        SeamoonProtocol: "",
      } as AddressesType;

    case "matic":
      return {} as AddressesType;

    default:
      return undefined;
  }
};

export const KmsWeb3 = () => {
  const provider = new KmsProvider(
    (env.network.config as HttpNetworkConfig).url,
    { region, keyIds: [keyId] }
  );

  const web3 = new Web3(provider as any);
  return web3;
};

export const KmsSigner = () => {
  const kmsProvider = new KmsProvider(
    (env.network.config as HttpNetworkConfig).url,
    { region, keyIds: [keyId] }
  );

  const provider = new ethers.providers.Web3Provider(kmsProvider);
  return provider.getSigner(0);
};
