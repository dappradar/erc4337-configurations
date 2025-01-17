import fs from 'fs';
import path from 'path';
import { ChainConfig } from '../types';

export function loadChainConfig(chainId: string): ChainConfig | null {
    try {
        const configPath = path.join(__dirname, `../../chain-config/${chainId}/erc4337.json`);
        if (!fs.existsSync(configPath)) {
            return null;
        }

        const configContent = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error(`Error loading chain config: ${error}`);
        return null;
    }
} 