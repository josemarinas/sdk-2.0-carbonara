import { encodeAbiParameters, type Client, type Hex } from "viem";
import type { MultisigPluginSettings } from "./types";
import { contracts, getNetworkByChainId } from "@aragon/osx-commons-configs";
import { MULTISIG_METADATA } from "./metadata";
import type { Plugin } from "../commons";

export class MultisigPlugin {
  public static initialize({
    params,
    client,
  }: {
    client: Client;
    params: MultisigPluginSettings;
  }): Plugin {
    // assertions because im lazy
    const network = getNetworkByChainId(client.chain!.id)!;
    const data = encodeAbiParameters(
      MULTISIG_METADATA.pluginSetup.prepareInstallation.inputs,
      [params.members, params.votingSettings]
    );
    return {
      data,
      pluginRepoAddress: contracts[network.name]["v1.3.0"]!.MultisigRepoProxy
        .address as Hex,
    };
  }
}
