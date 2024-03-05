# sdk-class-viem

![Carbonara](./carbonara-code.png)
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
## Summary

This option is a class based SDK, it uses the viem client under the hood so it is full compatible with viem, but it does not use viem conventions. It also exposes the contract property to allow the user to interact with the contract directly.

## Usage
### Create a DAO with a multisig plugin
```typescript
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
```
