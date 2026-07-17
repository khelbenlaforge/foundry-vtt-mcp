import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export interface ActorManagementToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

/**
 * Generic actor/embedded-item CRUD, ported from upstream ea8c3b4 and stripped of
 * mgt2e-specific skill normalization — this fork is dnd5e-only.
 */
export class ActorManagementTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor({ foundryClient, logger }: ActorManagementToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ActorManagementTools' });
    this.errorHandler = new ErrorHandler(this.logger);
  }

  /**
   * Tool definitions for generic actor management operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'manage-actors',
        description:
          'Create, update, or delete actors, and update or delete items embedded on an actor. ' +
          'Use action to select the operation: "create" (new actors), "update" (patch existing actors\' ' +
          'name/img/system fields), "delete" (remove actors entirely), "update-items" (patch embedded ' +
          'item fields), or "delete-items" (remove embedded items from an actor). ' +
          'For "update"/"update-items", system field patches are merged into the existing data — ' +
          'omitted fields are left untouched. Dot-notation system keys (e.g. "attributes.hp.-=temp") ' +
          'are supported and honour Foundry\'s "-=" deletion operator at any depth.',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'update-items', 'delete-items'],
              description: 'Which CRUD operation to perform',
            },
            actors: {
              type: 'array',
              description: 'Actors to create (action: "create")',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', description: 'Foundry actor type, e.g. "character" or "npc"' },
                  img: { type: 'string' },
                  system: { type: 'object', description: 'System-specific data for the actor' },
                },
                required: ['name', 'type'],
              },
            },
            folder: {
              type: 'string',
              description: 'Folder name to create actors in (action: "create", default "Foundry MCP Actors")',
            },
            updates: {
              type: 'array',
              description: 'Actor patches to apply (action: "update")',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  img: { type: 'string' },
                  system: { type: 'object' },
                },
                required: ['id'],
              },
            },
            ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Actor IDs to delete (action: "delete")',
            },
            actorIdentifier: {
              type: 'string',
              description: 'Actor ID or name that owns the items being updated/deleted (action: "update-items"/"delete-items")',
            },
            itemUpdates: {
              type: 'array',
              description: 'Embedded item patches to apply (action: "update-items")',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  img: { type: 'string' },
                  system: { type: 'object' },
                },
                required: ['id'],
              },
            },
            itemIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Embedded item IDs to delete (action: "delete-items")',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  /**
   * Dispatch a manage-actors call to the appropriate handler based on args.action
   */
  async handleManageActors(args: any): Promise<any> {
    const action = args?.action;
    switch (action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'update-items':
        return this.handleUpdateItems(args);
      case 'delete-items':
        return this.handleDeleteItems(args);
      default:
        throw new Error(
          `Unknown action "${action}" — expected one of: create, update, delete, update-items, delete-items`
        );
    }
  }

  // ── create ───────────────────────────────────────────────────────────────

  private async handleCreate(args: any): Promise<any> {
    const schema = z.object({
      actors: z
        .array(
          z.object({
            name: z.string().min(1),
            type: z.string().min(1),
            img: z.string().optional(),
            system: z.record(z.any()).optional(),
          })
        )
        .min(1),
      folder: z.string().optional(),
    });

    const { actors, folder } = schema.parse(args);

    this.logger.info('Creating actors', { count: actors.length });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.createActors', { actors, folder });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-actors (create)', 'actor creation');
    }
  }

  // ── update ───────────────────────────────────────────────────────────────

  private async handleUpdate(args: any): Promise<any> {
    const schema = z.object({
      updates: z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().optional(),
            img: z.string().optional(),
            system: z.record(z.any()).optional(),
          })
        )
        .min(1),
    });

    const { updates } = schema.parse(args);

    this.logger.info('Updating actors', { count: updates.length });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.updateActors', { updates });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-actors (update)', 'actor update');
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────

  private async handleDelete(args: any): Promise<any> {
    const schema = z.object({
      ids: z.array(z.string().min(1)).min(1),
    });

    const { ids } = schema.parse(args);

    this.logger.info('Deleting actors', { count: ids.length });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.deleteActors', { ids });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-actors (delete)', 'actor deletion');
    }
  }

  // ── update-items ─────────────────────────────────────────────────────────

  private async handleUpdateItems(args: any): Promise<any> {
    const schema = z.object({
      actorIdentifier: z.string().min(1),
      itemUpdates: z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().optional(),
            img: z.string().optional(),
            system: z.record(z.any()).optional(),
          })
        )
        .min(1),
    });

    const { actorIdentifier, itemUpdates } = schema.parse(args);

    this.logger.info('Updating actor embedded items', {
      actorIdentifier,
      count: itemUpdates.length,
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.updateActorItems', {
        actorIdentifier,
        itemUpdates,
      });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-actors (update-items)', 'actor item update');
    }
  }

  // ── delete-items ─────────────────────────────────────────────────────────

  private async handleDeleteItems(args: any): Promise<any> {
    const schema = z.object({
      actorIdentifier: z.string().min(1),
      itemIds: z.array(z.string().min(1)).min(1),
    });

    const { actorIdentifier, itemIds } = schema.parse(args);

    this.logger.info('Deleting actor embedded items', {
      actorIdentifier,
      count: itemIds.length,
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.deleteActorItems', {
        actorIdentifier,
        itemIds,
      });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-actors (delete-items)', 'actor item deletion');
    }
  }
}
