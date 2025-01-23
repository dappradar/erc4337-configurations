import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { loadChainConfig } from '../src/utils/config';
import { decodeUserOperation } from '../src/utils/decoder';
import fs from 'fs';
import path from 'path';

dotenv.config();

interface TestCase {
    txHash: string;
    expected: {
        from: string;
        to: string;
    }[];
}

interface ChainTest {
    chainId: string;
    tests: TestCase[];
}

async function runTest(chainId: string, test: TestCase) {
    const rpcUrl = process.env[`RPC_${chainId.toUpperCase()}`];
    if (!rpcUrl) {
        throw new Error(`RPC URL not found for chain ${chainId}`);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tx = await provider.getTransaction(test.txHash);
    
    if (!tx) {
        throw new Error('Transaction not found');
    }

    const config = loadChainConfig(chainId);
    if (!config) {
        throw new Error(`Configuration not found for chain ${chainId}`);
    }

    const result = await decodeUserOperation(tx.data, config);
    
    // Compare results
    if (result.length !== test.expected.length) {
        throw new Error(`Expected ${test.expected.length} operations, but got ${result.length}`);
    }

    for (let i = 0; i < result.length; i++) {
        if (result[i].from.toLowerCase() !== test.expected[i].from.toLowerCase()) {
            throw new Error(`Operation ${i}: Expected from ${test.expected[i].from}, but got ${result[i].from}`);
        }
        if (result[i].to.toLowerCase() !== test.expected[i].to.toLowerCase()) {
            throw new Error(`Operation ${i}: Expected to ${test.expected[i].to}, but got ${result[i].to}`);
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const specificChain = args[0];

    let failedTests = 0;
    let passedTests = 0;

    // Get all test files
    const testDir = path.join(__dirname, 'chains');
    const testFiles = fs.readdirSync(testDir)
        .filter(file => file.endsWith('.test.json'))
        .filter(file => !specificChain || file.startsWith(`${specificChain}.`));

    for (const testFile of testFiles) {
        const testPath = path.join(testDir, testFile);
        const chainTest: ChainTest = JSON.parse(fs.readFileSync(testPath, 'utf-8'));
        
        console.log(`\nRunning tests for ${chainTest.chainId}...`);
        for (const test of chainTest.tests) {
            try {
                await runTest(chainTest.chainId, test);
                console.log(`✅ Passed: ${test.txHash}`);
                passedTests++;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                console.error(`❌ Failed: ${test.txHash}`);
                console.error(`   Error: ${errorMessage}`);
                failedTests++;
            }
        }
    }

    console.log(`\nTest Summary:`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);

    if (failedTests > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Fatal error:', errorMessage);
    process.exit(1);
}); 