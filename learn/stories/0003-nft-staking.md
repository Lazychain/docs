# 3. User NFT Staking Flow

```mermaid
---
title: User NFT Staking Flow
---
flowchart LR
    A(User Logged) --> B{NFT on List?}
    B --> |Yes| C(Select Staking Period)
    C --> D(Execute and Pay Fees)
    D --> B    
    B --> |No| X(Exit flow)
```

::: warning
Add gherkin scenarios
:::

Notice: On the smart contract we should check sanity of the nft IPFS hash id to ensure that it belongs to a real Celestine slot society nft.
