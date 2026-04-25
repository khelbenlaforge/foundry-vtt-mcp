import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
export interface ItemImportToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}
export declare class ItemImportTools {
    private foundryClient;
    private logger;
    constructor({ foundryClient, logger }: ItemImportToolsOptions);
    getToolDefinitions(): {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                actorIdentifier: {
                    type: string;
                    description: string;
                };
                name: {
                    type: string;
                    description: string;
                };
                type: {
                    type: string;
                    description: string;
                    default: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                quantity: {
                    type: string;
                    description: string;
                    default: number;
                };
                uses: {
                    type: string;
                    description: string;
                    properties: {
                        value: {
                            type: string;
                            description: string;
                        };
                        max: {
                            type: string;
                            description: string;
                        };
                        recovery: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
                rarity: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    }[];
    handleAddItemToActor(args: unknown): Promise<string>;
}
