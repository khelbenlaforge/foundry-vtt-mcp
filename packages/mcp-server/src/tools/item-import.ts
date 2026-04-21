import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface ItemImportToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class ItemImportTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor({ foundryClient, logger }: ItemImportToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'ItemImportTools' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'add-item-to-actor',
        description: 'Add a homebrew item directly to a Foundry actor\'s sheet using createEmbeddedDocuments. Use for wondrous items, features, and equipment that are not in any compendium. Supports limited uses with long/short rest recovery.',
        inputSchema: {
          type: 'object',
          properties: {
            actorIdentifier: {
              type: 'string',
              description: 'Actor name or ID (e.g. "Jonathan \\"JJ\\" Jordan" or "nR9UqppLg1pWWX0J")',
            },
            name: {
              type: 'string',
              description: 'Item name',
            },
            type: {
              type: 'string',
              description: 'dnd5e item type: "feat", "equipment", "consumable", "weapon", "loot"',
              default: 'feat',
            },
            description: {
              type: 'string',
              description: 'HTML description of the item mechanics',
            },
            quantity: {
              type: 'number',
              description: 'Quantity (default: 1)',
              default: 1,
            },
            uses: {
              type: 'object',
              description: 'Limited uses configuration',
              properties: {
                value: { type: 'number', description: 'Current uses' },
                max: { type: 'number', description: 'Maximum uses' },
                recovery: {
                  type: 'string',
                  description: 'Recovery period: "lr" (long rest), "sr" (short rest), "day"',
                },
              },
              required: ['value', 'max', 'recovery'],
            },
            rarity: {
              type: 'string',
              description: 'Item rarity: "common", "uncommon", "rare", "veryRare", "legendary", "artifact", "unique"',
            },
          },
          required: ['actorIdentifier', 'name', 'description'],
        },
      },
    ];
  }

  async handleAddItemToActor(args: unknown) {
    const schema = z.object({
      actorIdentifier: z.string(),
      name: z.string(),
      type: z.string().optional().default('feat'),
      description: z.string(),
      quantity: z.number().optional().default(1),
      uses: z.object({
        value: z.number(),
        max: z.number(),
        recovery: z.string(),
      }).optional(),
      rarity: z.string().optional(),
    });
    const params = schema.parse(args);

    this.logger.info('Adding item to actor', { actor: params.actorIdentifier, item: params.name });

    const result = await this.foundryClient.query('foundry-mcp-bridge.addItemToActor', params) as Record<string, any>;

    if (!result?.success) {
      throw new Error(result?.error ?? 'addItemToActor failed');
    }

    return `Added "${params.name}" to actor. Item ID: ${result.itemId}`;
  }
}
