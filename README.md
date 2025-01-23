# ERC4337 Configuration Repository

A repository for blockchain protocols to submit and test their ERC4337 (Account Abstraction) configurations. These configurations are used by DappRadar to correctly parse and decode ERC4337 transactions across different chains.

## Overview

This repository serves two main purposes:
1. Collect ERC4337 configurations from different blockchain protocols
2. Provide tools to test and validate these configurations

## Prerequisites

- Node.js installed
- Access to chain RPC endpoints

## Installation

1. Clone the repository
```bash
git clone git@github.com:dappradar/erc4337-configurations.git
```

2. Install dependencies
```bash
npm install
```

3. Add your RPC URLs in the format:
```
RPC_CHAINNAME=your_rpc_url
```

## Adding Your Configuration

1. Create a new directory in `chain-config/` with your chain name
2. Add an `erc4337.json` file with your configuration:

```json
{
  "configurations": [
    {
      "entrypoint_address": "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
      "entrypoint_function_name": "handleOps",
      "entrypoint_function_abi": "function handleOps((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[], address)",
      "scw_function_name": "execute",
      "scw_function_abi": "function execute(address,uint256,bytes)"
    }
  ]
}
```

3. Add a test file in `test/chains/<chain>.test.json`:

```
"from" -> User address
"to" -> Smart contract address (with which user interacts)
```
```json
{
  "chainId": "your_chain_name",
  "tests": [
    {
      "txHash": "0x...",
      "expected": [
        {
          "from": "0x...",
          "to": "0x..."
        }, 
        {
          "from": "0x...",
          "to": "0x..."
        }
      ]
    }
  ]
}
```

## Testing Your Configuration

### Manual Testing
Test your configuration by decoding an actual ERC4337 transaction from your chain:

```bash
npm run decode <chain> <txHash>
```

Example:
```bash
npm run decode ethereum 0x123...abc
```

After adding test case for your chain - run it:
```bash
npm run test <chain>
```

Example:
```bash
npm run test b3
```

Each test case verifies that the transaction can be decoded correctly and matches the expected `from` and `to` addresses.

## Configuration Format

Each configuration should include:
- `entrypoint_address`: The address of the EntryPoint contract
- `entrypoint_function_name`: The function name (typically "handleOps")
- `entrypoint_function_abi`: The ABI of the entry point function
- `scw_function_name`: The smart contract wallet function name
- `scw_function_abi`: The ABI of the smart contract wallet function

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/chain-name`)
3. Add your configuration in `chain-config/<chain-name>/erc4337.json`
4. Add test cases in `test/chains/<chain-name>.test.json`
5. Test your configuration:
   - Run manual tests with `npm run decode`
   - Run automated tests with `npm run test <chain-name>`
6. Commit your changes (`git commit -m 'Add CHAIN_NAME configuration'`)
7. Push to the branch (`git push origin feature/chain-name`)
8. Open a Pull Request

## Contact

For questions and support, please open an issue in the repository.
