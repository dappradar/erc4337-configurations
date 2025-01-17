import { ethers } from 'ethers';
import { ChainConfig } from '../types';

export async function decodeUserOperation(
    txInput: string,
    config: ChainConfig
) {
    const result = [];
    let anySuccessfulDecode = false;
    
    for (const conf of config.configurations) {
        try {
            const entrypointFuncIface = new ethers.Interface([conf.entrypoint_function_abi]);
            const scwFuncIface = new ethers.Interface([conf.scw_function_abi]);

            const keyToIndexMap = {
                'sender': 0,
                'nonce': 1,
                'initCode': 2,
                'callData': 3,
                'callGasLimit': 4,
                'verificationGasLimit': 5,
                'preVerificationGas': 6,
                'maxFeePerGas': 7,
                'maxPriorityFeePerGas': 8,
                'paymasterAndData': 9,
                'signature': 10
            };

            const decoded = entrypointFuncIface.decodeFunctionData(
                conf.entrypoint_function_name,
                txInput
            );

            for (const userOp of decoded[0]) {
                try {
                    const callData = userOp[keyToIndexMap['callData']];
                    const scwCallDataDecoded = scwFuncIface.decodeFunctionData(
                        conf.scw_function_name,
                        callData
                    );
                    const to = scwCallDataDecoded[0];
                    result.push({
                        'from': userOp[keyToIndexMap['sender']],
                        'to': to
                    });
                    anySuccessfulDecode = true;
                } catch {
                    continue;
                }
            }

            if (anySuccessfulDecode) break;
        } catch {
            continue;
        }
    }

    if (result.length === 0) {
        throw new Error('Failed to decode with any configuration');
    }

    return result;
} 