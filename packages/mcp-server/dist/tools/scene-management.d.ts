import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
export interface SceneManagementToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}
/** Generic scene creation, configuration, deletion, and restore for Foundry map fields. */
export declare class SceneManagementTools {
    private foundryClient;
    private logger;
    private errorHandler;
    constructor({ foundryClient, logger }: SceneManagementToolsOptions);
    getToolDefinitions(): {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                action: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                scenes: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            width: {
                                type: string;
                                description: string;
                            };
                            height: {
                                type: string;
                                description: string;
                            };
                            padding: {
                                type: string;
                                description: string;
                            };
                            background: {
                                type: string;
                                description: string;
                            };
                            backgroundColor: {
                                type: string;
                                description: string;
                            };
                            grid: {
                                type: string;
                                description: string;
                            };
                            gridSize: {
                                type: string;
                                description: string;
                            };
                            gridDistance: {
                                type: string;
                                description: string;
                            };
                            gridUnits: {
                                type: string;
                                description: string;
                            };
                            navigation: {
                                type: string;
                                description: string;
                            };
                            navName: {
                                type: string;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                };
                folder: {
                    type: string;
                    description: string;
                };
                updates: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            identifier: {
                                type: string;
                                description: string;
                            };
                            name: {
                                type: string;
                            };
                            width: {
                                type: string;
                                description: string;
                            };
                            height: {
                                type: string;
                                description: string;
                            };
                            padding: {
                                type: string;
                                description: string;
                            };
                            background: {
                                type: string;
                                description: string;
                            };
                            backgroundColor: {
                                type: string;
                                description: string;
                            };
                            grid: {
                                type: string;
                                description: string;
                            };
                            gridSize: {
                                type: string;
                                description: string;
                            };
                            gridDistance: {
                                type: string;
                                description: string;
                            };
                            gridUnits: {
                                type: string;
                                description: string;
                            };
                            navigation: {
                                type: string;
                                description: string;
                            };
                            navName: {
                                type: string;
                                description: string;
                            };
                            folder: {
                                type: string;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                };
                identifiers: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                    };
                };
            };
            required: string[];
        };
    }[];
    handleManageScenes(args: any): Promise<any>;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    private handleRestore;
}
