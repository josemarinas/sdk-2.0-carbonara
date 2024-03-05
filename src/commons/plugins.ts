import type { Hex } from "viem";

export type Plugin = {
    pluginRepoAddress: Hex;
    data: Hex;
  };
  
  export type ContractPlugin = {
    pluginSetupRef: {
      versionTag: {
        release: number;
        build: number;
      };
      pluginSetupRepo: Hex;
    };
    data: Hex;
  };