import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { loadChainConfig } from '../utils/config';
import { decodeUserOperation } from '../utils/decoder';

dotenv.config();

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.error('Usage: npm run decode <chainId> <txHash>');
        process.exit(1);
    }

    const [chainId, txHash] = args;
    
    const rpcUrl = process.env[`RPC_${chainId.toUpperCase()}`];
    if (!rpcUrl) {
        console.error(`RPC URL not found for chain ${chainId}. Please add RPC_${chainId.toUpperCase()} to your .env file`);
        process.exit(1);
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
            console.error('Transaction not found');
            process.exit(1);
        }

        const config = loadChainConfig(chainId);
        if (!config) {
            console.error(`Configuration not found for chain ${chainId}`);
            process.exit(1);
        }

    

        const result = await decodeUserOperation(tx.data, config);
        console.log('Decoded Transaction:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error decoding transaction:', error);
        process.exit(1);
    }
}

main(); 