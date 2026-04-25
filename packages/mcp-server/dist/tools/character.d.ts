import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { SystemRegistry } from '../systems/system-registry.js';
export interface CharacterToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
    systemRegistry?: SystemRegistry;
}
export declare class CharacterTools {
    private foundryClient;
    private logger;
    private systemRegistry;
    private cachedGameSystem;
    constructor({ foundryClient, logger, systemRegistry }: CharacterToolsOptions);
    /**
     * Get or detect the game system (cached)
     */
    private getGameSystem;
    /**
     * Tool: get-character
     * Retrieve detailed information about a specific character
     */
    getToolDefinitions(): ({
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                identifier: {
                    type: string;
                    description: string;
                };
                characterIdentifier?: never;
                entityIdentifier?: never;
                type?: never;
                actorIdentifier?: never;
                itemIdentifier?: never;
                targets?: never;
                consume?: never;
                spellLevel?: never;
                query?: never;
                category?: never;
                limit?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                characterIdentifier: {
                    type: string;
                    description: string;
                };
                entityIdentifier: {
                    type: string;
                    description: string;
                };
                identifier?: never;
                type?: never;
                actorIdentifier?: never;
                itemIdentifier?: never;
                targets?: never;
                consume?: never;
                spellLevel?: never;
                query?: never;
                category?: never;
                limit?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                type: {
                    type: string;
                    description: string;
                };
                identifier?: never;
                characterIdentifier?: never;
                entityIdentifier?: never;
                actorIdentifier?: never;
                itemIdentifier?: never;
                targets?: never;
                consume?: never;
                spellLevel?: never;
                query?: never;
                category?: never;
                limit?: never;
            };
            required?: never;
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
                itemIdentifier: {
                    type: string;
                    description: string;
                };
                targets: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                consume: {
                    type: string;
                    description: string;
                };
                spellLevel: {
                    type: string;
                    description: string;
                };
                identifier?: never;
                characterIdentifier?: never;
                entityIdentifier?: never;
                type?: never;
                query?: never;
                category?: never;
                limit?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                characterIdentifier: {
                    type: string;
                    description: string;
                };
                query: {
                    type: string;
                    description: string;
                };
                type: {
                    type: string;
                    description: string;
                };
                category: {
                    type: string;
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
                identifier?: never;
                entityIdentifier?: never;
                actorIdentifier?: never;
                itemIdentifier?: never;
                targets?: never;
                consume?: never;
                spellLevel?: never;
            };
            required: string[];
        };
    })[];
    handleGetCharacter(args: any): Promise<any>;
    handleGetCharacterEntity(args: any): Promise<any>;
    handleListCharacters(args: any): Promise<any>;
    handleUseItem(args: any): Promise<any>;
    handleSearchCharacterItems(args: any): Promise<any>;
    private formatCharacterResponse;
    private formatSpellcasting;
    private formatActions;
    private extractBasicInfo;
    private extractStats;
    private formatItems;
    private formatEffects;
    private truncateText;
}
