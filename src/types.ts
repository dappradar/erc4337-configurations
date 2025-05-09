export interface ERC4337Config {
    entrypoint_address: string;
    entrypoint_function_name: string;
    entrypoint_function_abi: string;
    scw_function_name: string;
    scw_function_abi: string;
    op_calldata_index: number;
    op_calldata_skip_bytes: number;
}

export interface ChainConfig {
    configurations: ERC4337Config[];
} 