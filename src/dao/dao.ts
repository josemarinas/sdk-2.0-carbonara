import {
  getContract,
  type Client,
  type GetContractReturnType,
  type Hex,
  parseEventLogs,
} from "viem";
import {
  DAO_ABI,
  DAO_FACTORY_ABI,
  DAO_REGISTRY_ABI,
  PLUGIN_REPO_OVERLOAD_ABI,
} from "../abi";
import { contracts, getNetworkByChainId } from "@aragon/osx-commons-configs";
import type {CreateDaoParams } from "./types";
import { ADDRESS_ZERO } from "../commons/constants";
import { waitForTransactionReceipt } from "viem/actions";
import type { ContractPlugin } from "../commons";

export class Dao {
  private _contract:
    | GetContractReturnType<typeof DAO_ABI, Client, Hex>
    | undefined = undefined;
  private _address: Hex;
  private _client: Client | undefined = undefined;
  constructor(address: Hex) {
    this._address = address;
  }

  public connect(client: Client) {
    this._client = client;
    this._contract = getContract({
      abi: [...DAO_ABI] as const,
      client,
      address: this._address,
    });
    return this;
  }

  get contract() {
    if (this._contract === undefined) {
      throw new Error("Contract is not connected");
    }
    return this._contract;
  }

  get address() {
    return this._address;
  }

  static async create({
    client,
    params,
  }: {
    client: Client;
    params: CreateDaoParams;
  }) {
    const chainId = client.chain?.id;
    if (!chainId) {
      throw new Error("Chain ID not found");
    }
    const networkName = getNetworkByChainId(chainId)?.name;
    if (!networkName) {
      throw new Error("Network not found");
    }
    const address = contracts[networkName]["v1.3.0"]?.DAOFactory.address as Hex;
    if (!address) {
      throw new Error("DAOFactory address not found");
    }
    const daoFactoryContract = getContract({
      client,
      address: address,
      abi: [...DAO_FACTORY_ABI] as const,
    });
    const plugins: ContractPlugin[] = [];
    for (const plugin of params.plugins) {
      const pluginRepoContract = getContract({
        client,
        address: plugin.pluginRepoAddress,
        abi: [...PLUGIN_REPO_OVERLOAD_ABI] as const,
      });
      const currentRelease = await pluginRepoContract.read.latestRelease();
      const latestVersion = await pluginRepoContract.read.getLatestVersion([
        currentRelease,
      ]);
      const version = latestVersion.tag as { release: number; build: number };
      plugins.push({
        pluginSetupRef: {
          versionTag: version,
          pluginSetupRepo: plugin.pluginRepoAddress,
        },
        data: plugin.data,
      });
    }

    const hash = await daoFactoryContract.write.createDao(
      [
        {
          trustedForwarder: params.trustedForwarder ?? ADDRESS_ZERO,
          daoURI: params.daoUri ?? "",
          subdomain: params.ensSubdomain ?? "",
          metadata: "0x", // stringToBytes(params.metadataUri),
        },
        plugins,
      ],
      {} as any
    );
    const transactionReceipt = await waitForTransactionReceipt(client, {
      hash,
    });
    const daoRegisteredLogs = parseEventLogs({
      logs: transactionReceipt.logs,
      abi: [...DAO_REGISTRY_ABI] as const,
      eventName: "DAORegistered",
    });
    const args = daoRegisteredLogs[0].args as { dao: Hex };
    return new Dao(args.dao).connect(client);
  }
  public async prepareInstallation() {
    console.log("Preparing installation");
  }
  public async prepareUpdate() {
    console.log("Preparing update");
  }
  public async prepareUninstallation() {
    console.log("Preparing uninstallation");
  }
}
