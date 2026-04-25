import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

const ALLOWED_ITEM_TYPES = ['feat', 'equipment', 'consumable', 'weapon', 'loot'] as const;
const ALLOWED_ITEM_RARITIES = ['common', 'uncommon', 'rare', 'veryRare', 'legendary', 'artifact', 'unique'] as const;
const ALLOWED_RECOVERY_PERIODS = ['lr', 'sr', 'day'] as const;

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
      type: z.enum(ALLOWED_ITEM_TYPES).optional().default('feat'),
      description: z.string(),
      quantity: z.number().int().positive().finite().optional().default(1),
      uses: z.object({
        value: z.number().int().nonnegative().finite(),
        max: z.number().int().nonnegative().finite(),
        recovery: z.enum(ALLOWED_RECOVERY_PERIODS),
      }).refine((uses) => uses.value <= uses.max, {
        message: 'uses.value must be less than or equal to uses.max',
      }).optional(),
      rarity: z.enum(ALLOWED_ITEM_RARITIES).optional(),
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
