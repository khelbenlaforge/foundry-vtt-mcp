import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
export interface CreatureImportToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}
export declare class CreatureImportTools {
    private foundryClient;
    private logger;
    constructor({ foundryClient, logger }: CreatureImportToolsOptions);
    getToolDefinitions(): {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                filePath: {
                    type: string;
                    description: string;
                };
                addToScene: {
                    type: string;
                    description: string;
                    default: boolean;
                };
                quantity: {
                    type: string;
                    description: string;
                    default: number;
                };
            };
            required: string[];
        };
    }[];
    handleImportCreatureFromVault(args: unknown): Promise<string>;
}
