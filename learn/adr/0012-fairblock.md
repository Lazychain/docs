# Faiblock

## Goal

Analysis, Design and implementation of an smart contract app that allow the users to play a `lottery` system gaining nfts in the process.

## Links

- [Fairblock Architecture](https://docs.fairblock.network/assets/images/cosmos_architecture-67fb3256597a774426ea433ea56a3d62.png)
- [commit-reveal-scheme](https://blog.jarrodwatts.com/understanding-the-commit-reveal-scheme-with-solidity-examples)
- [randomness-in-solidity](https://medium.com/coinmonks/randomness-in-solidity-933eaa6ccff1)

## Fairblock Smart contracts

- **IBE_HASHING** : `ibe-contract-hashing.wasm` verifies the correctness of the ciphertext based on the Boneh-Franklin Identity-Based Encryption (BF-IBE) algorithm. It calculates a hash over the message and sigma, multiplies it by P, and verifies that the result matches the U component in the ciphertext.
- **IBE_CONTRACT**: `ibe.wasm` decrypts the ciphertext and recovers the message (which is the symmetric key for the second layer of encryption). It leverages the IBE Contract (Hashing) for ciphertext validation.
- **CHACHA20_MAC**: `chacha20mac.wasm` computes the MAC for the ciphertext header using the key and ciphertext body.
- **CHACHA20_DECRYPTER**: `chacha20.wasm` performs symmetric key decryption using the provided key and returns the plaintext.
- **DECRYPTER**: `decrypter.wasm` serves as the main interface for the decryption process. It accepts the decryption key and ciphertext, invoking the appropriate contracts to perform the full decryption.

```mermaid
sequenceDiagram
    participant User
    participant Decrypter
    participant IBE Contract Hashing
    participant IBE Contract
    participant CHACHA20 MAC
    participant CHACHA20 Decrypter

    User->>Decrypter: Submit decryption key and ciphertext
    Decrypter->>IBE Contract Hashing: Verify ciphertext integrity
    IBE Contract Hashing-->>Decrypter: Verification result
    Decrypter->>IBE Contract: Decrypt ciphertext to obtain symmetric key
    IBE Contract-->>Decrypter: Symmetric key
    Decrypter->>CHACHA20 MAC: Verify ciphertext header integrity
    CHACHA20 MAC-->>Decrypter: Verification result
    Decrypter->>CHACHA20 Decrypter: Decrypt ciphertext body
    CHACHA20 Decrypter-->>Decrypter: Plaintext
    Decrypter->>User: Return plaintext
```

```mermaid
flowchart LR
    A[User] --> B{Decrypter}
    B --> C{IBE Contract Hashing}
    C --> D{IBE Contract}
    D --> E{CHACHA20 MAC}
    E --> F{CHACHA20 Decrypter}
    F --> B
    B --> A
```

## Integration

### Lottery Smart Contract

The `lottery` contract is the responsible for:

- Ownership the nfts until users winds, in that case it should transfer any `random nft` ownership to the winner.
- Keep track of `total_draws` and `lucky_10_ranking` (how successful is the market campaign and top 10 luckiest users for dashboard).
- Probability of win: 5%

Functions:

- EXECUTE:OWNER:constructor(address decrypter, number fees)
  - Store the owner and set other fields
- EXECUTE:OWNER:finalizeCampaign()
  - set true to campaignFinalized
- EXECUTE:OWNER:startCampaign()
  - set false to campaignFinalized
- EXECUTE:OWNER: claim() -> Result( (), error )
  - Verifies owner
  - send funds to the owner
- EXECUTE:ANYONE:draw(user_secret_hash: string) -> Result(draw:boolean, error)
  - check campaignFinalized == false.
    - throw error `CampaignOver`
  - check `fee` (funds sent)
    - throw error `InsuficientFundsSent`
  - Call random generator (Fairblock or commit-reveal-scheme) to get a number from 0 to 20 with `user_secret_hash`.
    - Consider here `re-entry attack`.
    - code: `uint(FairyringContract.latestRandomness()) % 20`
  - check if generated random number == `user_secret_hash` number
    - true:
      - Increase `total_draws`
      - Transfer an NFT ownership to `info.address`.
      - Update `lucky_10_ranking{}`.
        - get player_name from addr map
        - update player_name: count if new record.
      - Send response
        - { result: true, "ipfs_hash/id", total_draws }
        - Emit Winner Event
    - false:
      - Increase `total_draws`
      - Send Response:
        - { result: false, total_draws }
        - Emit Lose Event
- EXECUTE:ANYONE:setPlayerName(name: string) -> Result((), error)
  - use info.address and set name in a Map{address: name}
- QUERY:ANYONE:dashboard() -> Result({player_name: count}[])
  - return lucky_10_ranking{}
- QUERY:ANYONE:total_draws() -> Result(count: number)
- QUERY:ANYONE:getPlayerName() -> Result(name: string)

```solidity
    /**
     * @notice Initializes the lottery with a decryption contract, a start_time and a fee.
     * @param _decrypter Address of the decryption contract
     * @param _fee The fee required to submit a draw
     * @param _threshold Number to decide  if draw success or fail. Must be less than 100.
     */
    constructor(address _decrypter, uint256 _fee) {
        owner = msg.sender;
        decrypterContract = IDecrypter(_decrypter);
        fee = _fee;
        campaignFinalized = true;
        emit LotteryInitialized(_decrypter,_fee);
    }
```

### Tasks

### Environment

#### Forma

- network: sketchpad-1
- rpc:(<https://rpc.sketchpad-1.forma.art>)
- TIA: (0x2F9C0BCD2C37eE6211763E7688F7D6758FDdCF53)
- fairyRing Contract: (0x....?)
  - [FairyringContract](https://github.com/Fairblock/FairyringContract)
- fairyport
  - [fairyport](https://github.com/Fairblock/fairyport)

#### Fairyring

- network: fairyring-testnet-3

#### Lazy

- [FairyPort Node](IP:....)
- [Fair Node](IP:...)

##### Fairyport and Fair Node

`Docker compose` FairyPort and Fairy Nodes:

- FairyPort.Dockerfile:
  - Configure [.env](https://github.com/Fairblock/fairyport/blob/main/.env.example) and volume it.
  - Create [config.yaml] and volume it.
  - Make Dockerfile
    - volume the configuration
    - CMD=["fairyport","start","--config","$HOME/.fairyport/config.yml"
- FairBlock.Dockerfile:
  - [](https://github.com/Fairblock/fairyring.git)
    - Use version v0.9.1
    - docker_setup.sh ?
      - Procedure the same as cosmos blockchain (genesis, tweak configuration, create dev and validator wallets)
      - [initialize-the-fairyring-node](https://docs.fairblock.network/docs/running-a-node/run_testnet_node#initialize-the-fairyring-node)
      - [validating_on_testnet](https://docs.fairblock.network/docs/running-a-node/validating_on_testnet)

```bash
git clone https://github.com/Fairblock/fairyport.git
cd fairyport && make install
```

```bash
git clone https://github.com/Fairblock/fairyring.git
cd fairyring && git checkout v0.9.1 && make install
```

[fairyPort configuration]

We are not relaying anything to a cosmos chain, so no change on `cosmosrelayconfig`

```yaml
cosmosrelayconfig:
    derivepath: m/44'/118'/0'/0/0
    destinationnode:
        accountprefix: fairy
        chainid: fairyring_devnet
        grpcport: 9090
        ip: 127.0.0.1
        port: 26657
        protocol: tcp
    metricsport: 2224
evmrelaytarget:
    chainrpc: wss://ws.sketchpad-1.forma.art
    contractaddress: update_to_fairyring_contract_address
fairyringnodews:
    ip: fairyring-testnet-3
    port: 26657
    protocol: tcp
```

[.env]

```
EVM_PKEY=...
COSMOS_MNEMONIC="..."
```
