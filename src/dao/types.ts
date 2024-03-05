import type { Hex } from "viem";
import type { Plugin } from "../commons";

export type CreateDaoParams = {
  ensSubdomain?: string;
  metadata: DaoMetadata;
  daoUri?: string;
  trustedForwarder?: Hex;
  plugins: Plugin[];
};
export type DaoMetadata = {
  name: string;
  description: string;
  avatar?: string;
  links: DaoResourceLink[];
};
export type DaoResourceLink = { name: string; url: string };
