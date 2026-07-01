import { z } from 'zod';
const ALLOWED_ITEM_TYPES = ['feat', 'equipment', 'consumable', 'weapon', 'loot'];
const ALLOWED_ITEM_RARITIES = ['common', 'uncommon', 'rare', 'veryRare', 'legendary', 'artifact', 'unique'];
const ALLOWED_RECOVERY_PERIODS = ['lr', 'sr', 'day'];
const ALLOWED_ACTIVITY_TYPES = ['attack', 'damage', 'save', 'heal', 'utility'];
const ALLOWED_ACTIVATION_TYPES = ['action', 'bonus', 'reaction', 'minute', 'hour', 'special', ''];
const ALLOWED_PASSIVE_TYPES = [
    'attack_bonus_mwak', 'attack_bonus_rwak', 'damage_bonus_mwak', 'damage_bonus_rwak',
    'ability_check_bonus', 'save_bonus', 'skill_check_bonus', 'spell_dc_bonus',
    'skill_proficiency', 'skill_expertise',
    'damage_resistance', 'damage_immunity', 'damage_vulnerability', 'condition_immunity',
    'language', 'size', 'movement_speed', 'movement_hover', 'sense_range',
    'hp_bonus_flat', 'hp_bonus_per_level', 'ac_formula',
    'initiative_advantage', 'reroll_ones', 'reroll_lowest_advantage',
    'crit_threshold', 'crit_extra_dice',
];
const usesSchema = z.object({
    value: z.number().int().nonnegative().finite(),
    max: z.number().int().nonnegative().finite(),
    recovery: z.enum(ALLOWED_RECOVERY_PERIODS),
}).refine((uses) => uses.value <= uses.max, {
    message: 'uses.value must be less than or equal to uses.max',
});
const damagePartSchema = z.object({
    number: z.number().int().positive(),
    denomination: z.number().int().nonnegative(),
    bonus: z.string().optional().default(''),
    types: z.array(z.string()).min(1),
});
const healingSchema = damagePartSchema.omit({ types: true }).extend({
    types: z.array(z.string()).optional().default([]),
});
const activitySchema = z.object({
    type: z.enum(ALLOWED_ACTIVITY_TYPES),
    name: z.string(),
    activation: z.object({
        type: z.enum(ALLOWED_ACTIVATION_TYPES).optional().default('action'),
        value: z.number().int().positive().optional(),
    }).optional().default({ type: 'action' }),
    description: z.string().optional().default(''),
    range: z.object({ value: z.number().optional(), units: z.string().optional() }).optional(),
    target: z.object({ count: z.union([z.string(), z.number()]).optional(), type: z.string().optional() }).optional(),
    uses: usesSchema.optional(),
    attack: z.object({
        ability: z.enum(['str', 'dex', 'spellcasting', 'none', '']).optional().default(''),
        bonus: z.string().optional().default(''),
        attackType: z.enum(['melee', 'ranged']).optional().default('melee'),
        classification: z.enum(['weapon', 'spell', 'unarmed']).optional().default('weapon'),
    }).optional(),
    save: z.object({
        ability: z.array(z.string()).min(1),
        dc: z.union([z.number(), z.string()]),
        onSave: z.enum(['half', 'none', 'full']).optional().default('half'),
    }).optional(),
    damageParts: z.array(damagePartSchema).optional(),
    healing: healingSchema.optional(),
    roll: z.object({ formula: z.string(), name: z.string().optional() }).optional(),
}).refine((a) => a.type !== 'attack' || !!a.attack, { message: 'attack activities require an `attack` block' })
    .refine((a) => a.type !== 'save' || !!a.save, { message: 'save activities require a `save` block' })
    .refine((a) => a.type !== 'heal' || !!a.healing, { message: 'heal activities require a `healing` block' })
    .refine((a) => a.type !== 'utility' || !!a.roll, { message: 'utility activities require a `roll` block' })
    .refine((a) => a.type !== 'damage' || !!a.damageParts?.length, { message: 'damage activities require `damageParts`' });
const PASSIVE_TYPES_REQUIRING_TARGET = [
    'skill_proficiency', 'skill_expertise', 'sense_range', 'movement_speed',
];
const passiveEffectSchema = z.object({
    name: z.string(),
    passiveType: z.enum(ALLOWED_PASSIVE_TYPES),
    value: z.union([z.string(), z.number(), z.boolean()]),
    target: z.string().optional(),
}).refine((p) => !PASSIVE_TYPES_REQUIRING_TARGET.includes(p.passiveType) || !!p.target, { message: `\`target\` is required for passiveType in: ${PASSIVE_TYPES_REQUIRING_TARGET.join(', ')}` });
const inertAbilitySchema = z.object({
    name: z.string(),
    description: z.string(),
});
export class ItemImportTools {
    foundryClient;
    logger;
    constructor({ foundryClient, logger }) {
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
                        requiresAttunement: {
                            type: 'boolean',
                            description: 'Whether the item requires attunement (per its actual rules text — do not infer from rarity). Default: false. Only meaningful for "equipment"/"weapon" items carrying `passiveEffects`.',
                            default: false,
                        },
                        equipped: {
                            type: 'boolean',
                            description: 'Explicitly mark the item equipped/unequipped. If omitted, defaults to true when the item is "equipment"/"weapon" and carries `passiveEffects` (since transfer effects are suppressed on unequipped gear) — set explicitly to false to import a stash/reserve item unequipped (its passives won\'t apply until equipped in Foundry).',
                        },
                        activities: {
                            type: 'array',
                            description: 'Rollable abilities (attack/damage/save/heal/utility) — become real dnd5e Activities with buttons in the Actions tab. Each activity may carry its own independent `uses` (value/max/recovery), separate from the item-level `uses`.',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', description: '"attack" | "damage" | "save" | "heal" | "utility"' },
                                    name: { type: 'string', description: 'Ability name — handler prefixes with "<Item Name>: "' },
                                    activation: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string', description: '"action" | "bonus" | "reaction" | "minute" | "hour" | "special" | ""' },
                                            value: { type: 'number' },
                                        },
                                    },
                                    description: { type: 'string' },
                                    range: { type: 'object', properties: { value: { type: 'number' }, units: { type: 'string' } } },
                                    target: { type: 'object', properties: { count: {}, type: { type: 'string' } } },
                                    uses: {
                                        type: 'object',
                                        description: 'Per-activity limited uses, independent of item-level uses',
                                        properties: {
                                            value: { type: 'number' },
                                            max: { type: 'number' },
                                            recovery: { type: 'string', description: '"lr" | "sr" | "day"' },
                                        },
                                    },
                                    attack: {
                                        type: 'object',
                                        description: 'Required when type is "attack"',
                                        properties: {
                                            ability: { type: 'string', description: '"str" | "dex" | "spellcasting" | "none" | ""' },
                                            bonus: { type: 'string' },
                                            attackType: { type: 'string', description: '"melee" | "ranged"' },
                                            classification: { type: 'string', description: '"weapon" | "spell" | "unarmed"' },
                                        },
                                    },
                                    save: {
                                        type: 'object',
                                        description: 'Required when type is "save"',
                                        properties: {
                                            ability: { type: 'array', items: { type: 'string' } },
                                            dc: { description: 'Fixed number, or a formula string e.g. "spellcasting"' },
                                            onSave: { type: 'string', description: '"half" | "none" | "full"' },
                                        },
                                    },
                                    damageParts: {
                                        type: 'array',
                                        description: 'Required when type is "damage" (or "attack"/"save" for their damage rolls)',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                number: { type: 'number' },
                                                denomination: { type: 'number', description: 'Die size, e.g. 6 for d6; 0 for a flat bonus only' },
                                                bonus: { type: 'string' },
                                                types: { type: 'array', items: { type: 'string' }, description: 'e.g. ["fire"]' },
                                            },
                                        },
                                    },
                                    healing: {
                                        type: 'object',
                                        description: 'Required when type is "heal"',
                                        properties: {
                                            number: { type: 'number' },
                                            denomination: { type: 'number' },
                                            bonus: { type: 'string' },
                                        },
                                    },
                                    roll: {
                                        type: 'object',
                                        description: 'Required when type is "utility"',
                                        properties: {
                                            formula: { type: 'string' },
                                            name: { type: 'string' },
                                        },
                                    },
                                },
                                required: ['type', 'name'],
                            },
                        },
                        passiveEffects: {
                            type: 'array',
                            description: 'Automatable passive bonuses/traits — become real dnd5e ActiveEffects that auto-apply, no manual math. Pick `passiveType` from the curated vocabulary; never invent raw dnd5e change keys.',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', description: 'Ability name — handler prefixes with "<Item Name>: "' },
                                    passiveType: {
                                        type: 'string',
                                        description: `One of: ${ALLOWED_PASSIVE_TYPES.join(', ')}`,
                                    },
                                    value: { description: 'Bonus/flag value, e.g. "+1", 30, true, "fire", "draconic"' },
                                    target: { type: 'string', description: 'Sub-target when needed, e.g. skill key "prc", sense "darkvision"' },
                                },
                                required: ['name', 'passiveType', 'value'],
                            },
                        },
                        inertAbilities: {
                            type: 'array',
                            description: 'Non-automatable abilities (DM-adjudicated/narrative, no data hook) — imported as separate lightweight Feature sub-items so the player can see them without opening the parent item.',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                },
                                required: ['name', 'description'],
                            },
                        },
                    },
                    required: ['actorIdentifier', 'name', 'description'],
                },
            },
        ];
    }
    async handleAddItemToActor(args) {
        const schema = z.object({
            actorIdentifier: z.string(),
            name: z.string(),
            type: z.enum(ALLOWED_ITEM_TYPES).optional().default('feat'),
            description: z.string(),
            quantity: z.number().int().positive().finite().optional().default(1),
            uses: usesSchema.optional(),
            rarity: z.enum(ALLOWED_ITEM_RARITIES).optional(),
            requiresAttunement: z.boolean().optional().default(false),
            equipped: z.boolean().optional(),
            activities: z.array(activitySchema).optional(),
            passiveEffects: z.array(passiveEffectSchema).optional(),
            inertAbilities: z.array(inertAbilitySchema).optional(),
        });
        const params = schema.parse(args);
        this.logger.info('Adding item to actor', { actor: params.actorIdentifier, item: params.name });
        const result = await this.foundryClient.query('foundry-mcp-bridge.addItemToActor', params);
        if (!result?.success) {
            throw new Error(result?.error ?? 'addItemToActor failed');
        }
        const parts = [`Added "${params.name}" to actor. Item ID: ${result.itemId}`];
        if (Array.isArray(result.stubItemIds) && result.stubItemIds.length) {
            parts.push(`Inert stub items created: ${result.stubItemIds.join(', ')}`);
        }
        if (result.warning) {
            parts.push(`WARNING: ${result.warning}`);
        }
        return parts.join(' ');
    }
}
//# sourceMappingURL=item-import.js.map