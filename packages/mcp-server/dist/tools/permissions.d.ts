import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
export interface PermissionsToolsOptions {
    foundryClient: FoundryClient;
    logger: Logger;
}
/** Read-only access to Foundry's world role permissions and document ownership. */
export declare class PermissionsTools {
    private foundryClient;
    private logger;
    constructor({ foundryClient, logger }: PermissionsToolsOptions);
    getToolDefinitions(): {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                identifier: {
                    type: string;
                    description: string;
                };
                documentType: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
        };
    }[];
    handleGetPermissions(args: any): Promise<any>;
}
