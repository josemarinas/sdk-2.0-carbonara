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

// encode the plugin data
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

// static call to create a DAO
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
// use the full contract to access native viem functions
await dao.contract.read.daoURI();
// custom functions
dao.prepareInstallation();
dao.prepareUpdate();
dao.prepareUninstallation();
// access the address of the contract
console.log(dao.address);



// alternative to the above by putting all the functions 
// that write to the contract under the write property

// dao.write.prepareInstallation()
// dao.write.prepareUpdate()
// dao.write.prepareUninstallation()
