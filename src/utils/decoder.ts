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
            const scwFunction = scwFuncIface.getFunction(conf.scw_function_name);
            if (!scwFunction || !scwFunction.inputs) {
                continue;
            }

            const scwFunctionParams = scwFunction.inputs;
            const isAddressFieldDefined = scwFunctionParams.length > 0 && scwFunctionParams[0].type.includes('address');
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
                    
                    let to;
                    if (isAddressFieldDefined) {
                        if (Array.isArray(scwCallDataDecoded[0])) {
                            to = scwCallDataDecoded[0][0];
                        } else {
                            to = scwCallDataDecoded[0];
                        }
                    } else if (scwCallDataDecoded[1] && scwCallDataDecoded[1].startsWith('0x')) {
                        to = scwCallDataDecoded[1].slice(0, 42);
                    }

                    const from = userOp[keyToIndexMap['sender']];
                    if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
                        continue;
                    }

                    result.push({
                        'from': from,
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