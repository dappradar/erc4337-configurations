export interface ERC4337Config {
    entrypoint_address: string;
    entrypoint_function_name: string;
    entrypoint_function_abi: string;
    scw_function_name: string;
    scw_function_abi: string;
}

export interface ChainConfig {
    configurations: ERC4337Config[];
} 