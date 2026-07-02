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
    getToolDefinitions(): ({
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
                requiresAttunement: {
                    type: string;
                    description: string;
                    default: boolean;
                };
                equipped: {
                    type: string;
                    description: string;
                };
                activities: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            type: {
                                type: string;
                                description: string;
                            };
                            name: {
                                type: string;
                                description: string;
                            };
                            activation: {
                                type: string;
                                properties: {
                                    type: {
                                        type: string;
                                        description: string;
                                    };
                                    value: {
                                        type: string;
                                    };
                                };
                            };
                            description: {
                                type: string;
                            };
                            range: {
                                type: string;
                                properties: {
                                    value: {
                                        type: string;
                                    };
                                    units: {
                                        type: string;
                                    };
                                };
                            };
                            target: {
                                type: string;
                                properties: {
                                    count: {};
                                    type: {
                                        type: string;
                                    };
                                };
                            };
                            uses: {
                                type: string;
                                description: string;
                                properties: {
                                    value: {
                                        type: string;
                                    };
                                    max: {
                                        type: string;
                                    };
                                    recovery: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                            attack: {
                                type: string;
                                description: string;
                                properties: {
                                    ability: {
                                        type: string;
                                        description: string;
                                    };
                                    bonus: {
                                        type: string;
                                    };
                                    attackType: {
                                        type: string;
                                        description: string;
                                    };
                                    classification: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                            save: {
                                type: string;
                                description: string;
                                properties: {
                                    ability: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    dc: {
                                        description: string;
                                    };
                                    onSave: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                            damageParts: {
                                type: string;
                                description: string;
                                items: {
                                    type: string;
                                    properties: {
                                        number: {
                                            type: string;
                                        };
                                        denomination: {
                                            type: string;
                                            description: string;
                                        };
                                        bonus: {
                                            type: string;
                                        };
                                        types: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                            description: string;
                                        };
                                    };
                                };
                            };
                            healing: {
                                type: string;
                                description: string;
                                properties: {
                                    number: {
                                        type: string;
                                    };
                                    denomination: {
                                        type: string;
                                    };
                                    bonus: {
                                        type: string;
                                    };
                                };
                            };
                            roll: {
                                type: string;
                                description: string;
                                properties: {
                                    formula: {
                                        type: string;
                                    };
                                    name: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                passiveEffects: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                                description: string;
                            };
                            passiveType: {
                                type: string;
                                description: string;
                            };
                            value: {
                                description: string;
                            };
                            target: {
                                type: string;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                };
                inertAbilities: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            description: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                level?: never;
                school?: never;
                activation?: never;
                duration?: never;
                range?: never;
                target?: never;
                prepared?: never;
                ritual?: never;
            };
            required: string[];
        };
    } | {
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
                level: {
                    type: string;
                    description: string;
                };
                school: {
                    type: string;
                    description: string;
                };
                description: {
                    type: string;
                    description: string;
                };
                activation: {
                    type: string;
                    description: string;
                    properties: {
                        type: {
                            type: string;
                            description: string;
                        };
                        value: {
                            type: string;
                        };
                        condition: {
                            type: string;
                            description: string;
                        };
                    };
                };
                duration: {
                    type: string;
                    description: string;
                    properties: {
                        value: {
                            type: string;
                        };
                        units: {
                            type: string;
                            description: string;
                        };
                        concentration: {
                            type: string;
                        };
                    };
                };
                range: {
                    type: string;
                    properties: {
                        value: {
                            type: string;
                        };
                        units: {
                            type: string;
                            description: string;
                        };
                    };
                };
                target: {
                    type: string;
                    properties: {
                        count: {
                            type: string;
                        };
                        type: {
                            type: string;
                            description: string;
                        };
                    };
                };
                prepared: {
                    type: string;
                    description: string;
                    default: boolean;
                };
                ritual: {
                    type: string;
                    description: string;
                    default: boolean;
                };
                activities: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties?: never;
                        required?: never;
                    };
                };
                type?: never;
                quantity?: never;
                uses?: never;
                rarity?: never;
                requiresAttunement?: never;
                equipped?: never;
                passiveEffects?: never;
                inertAbilities?: never;
            };
            required: string[];
        };
    })[];
    handleAddItemToActor(args: unknown): Promise<string>;
    handleAddSpellToActor(args: unknown): Promise<string>;
}
