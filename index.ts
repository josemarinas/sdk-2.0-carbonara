import { privateKeyToAccount } from "viem/accounts";
import { MultisigPlugin } from "./src/multisig";
import { createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import { Dao } from "./src/dao";

const account = privateKeyToAccount(
  "0x..."
);

const client = createWalletClient({
  chain: goerli,
  account,
  transport: http(),
});

const multisigPlugin = MultisigPlugin.initialize({
  client,
  params: {
    members: [account.address],
    votingSettings: {
      onlyListed: true,
      minApprovals: 1,
    },
  },
});

const name = `goerli-test-${Date.now()}`;

const dao = await Dao.create({
  client,
  params: {
    ensSubdomain: name,
    metadata: {
      name,
      description: "Test DAO",
      links: [],
    },
    plugins: [multisigPlugin],
  },
});

await dao.contract.read.daoURI();
dao.prepareInstallation();
dao.prepareUpdate();
dao.prepareUninstallation();
console.log(dao.address);
// dao.write.prepareInstallation()
// dao.write.prepareUpdate()
// dao.write.prepareUninstallation()
