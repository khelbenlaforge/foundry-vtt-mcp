import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
export interface ActorManagementToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}
/**
 * Generic actor/embedded-item CRUD, ported from upstream ea8c3b4 and stripped of
 * mgt2e-specific skill normalization — this fork is dnd5e-only.
 */
export declare class ActorManagementTools {
    private foundryClient;
    private logger;
    private errorHandler;
    constructor({ foundryClient, logger }: ActorManagementToolsOptions);
    /**
     * Tool definitions for generic actor management operations
     */
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
                actors: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            type: {
                                type: string;
                                description: string;
                            };
                            img: {
                                type: string;
                            };
                            system: {
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
                            id: {
                                type: string;
                            };
                            name: {
                                type: string;
                            };
                            img: {
                                type: string;
                            };
                            system: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                ids: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                actorIds: {
                    type: string;
                    items: {
                        type: string;
                    };
                    minItems: number;
                    description: string;
                };
                placement: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                hidden: {
                    type: string;
                    description: string;
                };
                actorIdentifier: {
                    type: string;
                    description: string;
                };
                imagePath: {
                    type: string;
                    description: string;
                };
                ringEnabled: {
                    type: string;
                    description: string;
                };
                ringColor: {
                    type: string;
                    description: string;
                };
                confirmOverwrite: {
                    type: string;
                    description: string;
                };
                itemUpdates: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            id: {
                                type: string;
                            };
                            name: {
                                type: string;
                            };
                            img: {
                                type: string;
                            };
                            system: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                itemIds: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
            };
            required: string[];
        };
    }[];
    /**
     * Dispatch a manage-actors call to the appropriate handler based on args.action
     */
    handleManageActors(args: any): Promise<any>;
    private handlePlace;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    private handleSetToken;
    private handleRefreshFromSource;
    private handleUpdateItems;
    private handleDeleteItems;
}
