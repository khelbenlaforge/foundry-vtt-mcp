import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export interface WorldItemsToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class WorldItemsTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor({ foundryClient, logger }: WorldItemsToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'WorldItemsTools' });
    this.errorHandler = new ErrorHandler(this.logger);
  }

  getToolDefinitions() {
    return [
      {
        name: 'manage-world-items',
        description:
          'Manage Item documents in Foundry VTT. Use action to choose the operation: ' +
          '"create" (create world-level items in the sidebar), "list" (list world-level items ' +
          'with optional filters), "update" (patch existing world-level items by ID), ' +
          '"add-to-actor" (create and attach new items directly to an existing actor), or ' +
          '"remove-from-actor" (remove items from an actor by item IDs and/or names).',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'list', 'update', 'add-to-actor', 'remove-from-actor'],
              description: 'Which item-management operation to perform',
            },
            items: {
              type: 'array',
              minItems: 1,
              description:
                'Items to create for action "create" or "add-to-actor". Each item requires a name and a valid Foundry item type.',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Display name of the item' },
                  type: {
                    type: 'string',
                    description: 'Foundry item type for the active game system',
                  },
                  img: {
                    type: 'string',
                    description: 'Optional icon path',
                  },
                  system: {
                    type: 'object',
                    description: 'System-specific item data',
                    additionalProperties: true,
                  },
                  effects: {
                    type: 'array',
                    description: 'Optional active-effect data for world item creation',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                    },
                  },
                  flags: {
                    type: 'object',
                    description: 'Optional Foundry flags object for world item creation',
                    additionalProperties: true,
                  },
                },
                required: ['name', 'type'],
              },
            },
            folder: {
              type: 'string',
              description:
                'For "create": folder name or ID to place created world items into. For "list": filter results to items in this folder.',
            },
            updates: {
              type: 'array',
              minItems: 1,
              description: 'World item patches to apply for action "update".',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'ID of the world item to update' },
                  name: { type: 'string', description: 'New display name' },
                  img: { type: 'string', description: 'New icon path' },
                  system: {
                    type: 'object',
                    description: 'System-specific item fields to merge into the existing item',
                    additionalProperties: true,
                  },
                  folder: {
                    type: 'string',
                    description: 'Folder name or ID to move the item into',
                  },
                },
                required: ['id'],
              },
            },
            type: {
              type: 'string',
              description:
                'For "list": filter world items by type. For "remove-from-actor": constrain name-based removal to this item type.',
            },
            nameFilter: {
              type: 'string',
              description: 'For "list": case-insensitive substring match on item name.',
            },
            actorIdentifier: {
              type: 'string',
              description:
                'For "add-to-actor" and "remove-from-actor": actor name or ID that owns the items.',
            },
            itemIds: {
              type: 'array',
              items: { type: 'string' },
              description:
                'For "remove-from-actor": item IDs on the actor to remove.',
            },
            itemNames: {
              type: 'array',
              items: { type: 'string' },
              description:
                'For "remove-from-actor": item names on the actor to remove.',
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async handleManageWorldItems(args: any): Promise<any> {
    const action = args?.action;
    switch (action) {
      case 'create':
        return this.handleCreate(args);
      case 'list':
        return this.handleList(args);
      case 'update':
        return this.handleUpdate(args);
      case 'add-to-actor':
        return this.handleAddToActor(args);
      case 'remove-from-actor':
        return this.handleRemoveFromActor(args);
      default:
        throw new Error(
          `Unknown action "${action}" — expected one of: create, list, update, add-to-actor, remove-from-actor`
        );
    }
  }

  private async handleCreate(args: any): Promise<any> {
    const itemSchema = z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      img: z.string().optional(),
      system: z.record(z.any()).optional(),
      effects: z.array(z.record(z.any())).optional(),
      flags: z.record(z.any()).optional(),
    });

    const schema = z.object({
      items: z.array(itemSchema).min(1),
      folder: z.string().optional(),
    });

    const { items, folder } = schema.parse(args);

    this.logger.info('Creating world items', {
      count: items.length,
      folder: folder ?? null,
      types: items.map(item => item.type),
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.createWorldItems', {
        items,
        ...(folder !== undefined ? { folder } : {}),
      });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-world-items (create)', 'world item creation');
    }
  }

  private async handleList(args: any): Promise<any> {
    const schema = z.object({
      type: z.string().optional(),
      folder: z.string().optional(),
      nameFilter: z.string().optional(),
    });

    const { type, folder, nameFilter } = schema.parse(args);

    this.logger.info('Listing world items', {
      type: type ?? null,
      folder: folder ?? null,
      nameFilter: nameFilter ?? null,
    });

    try {
      const items = await this.foundryClient.query('foundry-mcp-bridge.listWorldItems', {
        ...(type !== undefined ? { type } : {}),
        ...(folder !== undefined ? { folder } : {}),
        ...(nameFilter !== undefined ? { nameFilter } : {}),
      });

      return {
        items: items ?? [],
        total: items?.length ?? 0,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-world-items (list)', 'world item listing');
    }
  }

  private async handleUpdate(args: any): Promise<any> {
    const schema = z.object({
      updates: z
        .array(
          z.object({
            id: z.string().min(1),
            name: z.string().optional(),
            img: z.string().optional(),
            system: z.record(z.any()).optional(),
            folder: z.string().optional(),
          })
        )
        .min(1),
    });

    const { updates } = schema.parse(args);

    this.logger.info('Updating world items', {
      count: updates.length,
      ids: updates.map(update => update.id),
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.updateWorldItems', { updates });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-world-items (update)', 'world item update');
    }
  }

  private async handleAddToActor(args: any): Promise<any> {
    const schema = z.object({
      actorIdentifier: z.string().min(1),
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            type: z.string().min(1),
            img: z.string().optional(),
            system: z.record(z.any()).optional(),
          })
        )
        .min(1),
    });

    const { actorIdentifier, items } = schema.parse(args);

    this.logger.info('Adding items to actor', {
      actorIdentifier,
      count: items.length,
      types: items.map(item => item.type),
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.addActorItems', {
        actorIdentifier,
        items,
      });
    } catch (error) {
      this.errorHandler.handleToolError(
        error,
        'manage-world-items (add-to-actor)',
        'adding items to actor'
      );
    }
  }

  private async handleRemoveFromActor(args: any): Promise<any> {
    const schema = z
      .object({
        actorIdentifier: z.string().min(1),
        itemIds: z.array(z.string().min(1)).optional(),
        itemNames: z.array(z.string().min(1)).optional(),
        type: z.string().optional(),
      })
      .refine(value => (value.itemIds?.length ?? 0) + (value.itemNames?.length ?? 0) > 0, {
        message: 'Provide itemIds and/or itemNames identifying the items to remove',
      });

    const { actorIdentifier, itemIds, itemNames, type } = schema.parse(args);

    this.logger.info('Removing items from actor', {
      actorIdentifier,
      ids: itemIds?.length ?? 0,
      names: itemNames?.length ?? 0,
      type: type ?? null,
    });

    try {
      return await this.foundryClient.query('foundry-mcp-bridge.removeActorItems', {
        actorIdentifier,
        ...(itemIds !== undefined ? { itemIds } : {}),
        ...(itemNames !== undefined ? { itemNames } : {}),
        ...(type !== undefined ? { type } : {}),
      });
    } catch (error) {
      this.errorHandler.handleToolError(
        error,
        'manage-world-items (remove-from-actor)',
        'removing items from actor'
      );
    }
  }
}
