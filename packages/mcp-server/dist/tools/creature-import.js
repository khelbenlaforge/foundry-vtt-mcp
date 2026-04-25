import { z } from 'zod';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
// ─── Fantasy Statblocks YAML → 5etools Creature JSON Parser ─────────────────
const SIZE_MAP = {
    tiny: 'T', small: 'S', medium: 'M', large: 'L', huge: 'H', gargantuan: 'G',
};
const ALIGNMENT_MAP = {
    'lawful good': ['L', 'G'],
    'neutral good': ['N', 'G'],
    'chaotic good': ['C', 'G'],
    'lawful neutral': ['L', 'N'],
    'true neutral': ['N'],
    'neutral': ['N'],
    'chaotic neutral': ['C', 'N'],
    'lawful evil': ['L', 'E'],
    'neutral evil': ['N', 'E'],
    'chaotic evil': ['C', 'E'],
    'unaligned': ['U'],
    'any alignment': ['A'],
    'any': ['A'],
};
const STAT_NAMES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function parseSpeed(speedStr) {
    const result = {};
    const parts = speedStr.split(',').map(s => s.trim());
    for (const part of parts) {
        const fly = part.match(/fly\s+(\d+)/i);
        const swim = part.match(/swim\s+(\d+)/i);
        const climb = part.match(/climb\s+(\d+)/i);
        const burrow = part.match(/burrow\s+(\d+)/i);
        const walk = part.match(/^(\d+)/);
        if (fly)
            result.fly = parseInt(fly[1]);
        else if (swim)
            result.swim = parseInt(swim[1]);
        else if (climb)
            result.climb = parseInt(climb[1]);
        else if (burrow)
            result.burrow = parseInt(burrow[1]);
        else if (walk)
            result.walk = parseInt(walk[1]);
    }
    return result;
}
function parseSenses(sensesStr) {
    const parts = sensesStr.split(',').map(s => s.trim());
    const senses = [];
    let passive = 10;
    for (const part of parts) {
        const pm = part.match(/passive\s+perception\s+(\d+)/i);
        if (pm)
            passive = parseInt(pm[1]);
        else
            senses.push(part.toLowerCase());
    }
    return { senses, passive };
}
// Fantasy Statblocks saves/skills are: [{wis: 7}, {cha: 5}]
function parseSavesOrSkills(arr) {
    const result = {};
    for (const item of arr) {
        for (const [key, val] of Object.entries(item)) {
            result[key] = val >= 0 ? `+${val}` : `${val}`;
        }
    }
    return result;
}
function mapEntries(items) {
    return items.map(item => ({ name: item.name, entries: [item.desc] }));
}
function extractStatblockYaml(markdown) {
    const match = markdown.match(/```statblock\r?\n([\s\S]*?)```/);
    return match ? match[1] : null;
}
function parseStatblock(rawYaml) {
    const parsed = yamlLoad(rawYaml);
    const hasStatsArray = Array.isArray(parsed.stats)
        && parsed.stats.length === 6
        && parsed.stats.every(isFiniteNumber);
    const hasStatFields = STAT_NAMES.every(stat => isFiniteNumber(parsed[stat]));
    if (typeof parsed.name !== 'string' || !parsed.name.trim()) {
        throw new Error('Statblock is missing required field: name');
    }
    if (!isFiniteNumber(parsed.ac)) {
        throw new Error('Statblock is missing required field: ac');
    }
    if (!isFiniteNumber(parsed.hp)) {
        throw new Error('Statblock is missing required field: hp');
    }
    if (!hasStatsArray && !hasStatFields) {
        throw new Error('Statblock is missing required field: stats');
    }
    const entry = {};
    // Identity
    entry.name = parsed.name;
    entry.source = 'HB';
    entry.page = 0;
    // Size → single-char code
    entry.size = [SIZE_MAP[parsed.size?.toLowerCase() ?? 'medium'] ?? 'M'];
    // Type (with optional subtype as tags)
    const typeStr = parsed.type?.toLowerCase() ?? 'humanoid';
    if (parsed.subtype) {
        entry.type = { type: typeStr, tags: [parsed.subtype.toLowerCase()] };
    }
    else {
        entry.type = typeStr;
    }
    // Alignment
    entry.alignment = ALIGNMENT_MAP[parsed.alignment?.toLowerCase() ?? 'unaligned'] ?? ['U'];
    // AC
    const acEntry = { ac: parsed.ac };
    if (parsed.ac_class)
        acEntry.from = [parsed.ac_class];
    entry.ac = [acEntry];
    // HP
    entry.hp = { average: parsed.hp, formula: parsed.hit_dice ?? '' };
    // Speed
    entry.speed = parseSpeed(parsed.speed ?? '30 ft.');
    // Ability scores
    if (hasStatsArray) {
        STAT_NAMES.forEach((stat, i) => { entry[stat] = parsed.stats[i]; });
    }
    else if (hasStatFields) {
        STAT_NAMES.forEach((stat) => { entry[stat] = parsed[stat]; });
    }
    // Saving throws
    if (Array.isArray(parsed.saves) && parsed.saves.length) {
        entry.save = parseSavesOrSkills(parsed.saves);
    }
    // Skills
    if (Array.isArray(parsed.skillsaves) && parsed.skillsaves.length) {
        entry.skill = parseSavesOrSkills(parsed.skillsaves);
    }
    // Damage resistances / immunities / condition immunities
    if (parsed.damage_resistances) {
        entry.resist = String(parsed.damage_resistances).split(',').map((s) => s.trim().toLowerCase());
    }
    if (parsed.damage_immunities) {
        entry.immune = String(parsed.damage_immunities).split(',').map((s) => s.trim().toLowerCase());
    }
    if (parsed.condition_immunities) {
        entry.conditionImmune = String(parsed.condition_immunities).split(',').map((s) => s.trim().toLowerCase());
    }
    // Senses + passive perception
    if (parsed.senses) {
        const { senses, passive } = parseSenses(String(parsed.senses));
        if (senses.length)
            entry.senses = senses;
        entry.passive = passive;
    }
    else {
        entry.passive = 10;
    }
    // Languages
    if (parsed.languages) {
        entry.languages = String(parsed.languages).split(',').map((s) => s.trim());
    }
    // CR
    entry.cr = String(parsed.cr ?? '0');
    // Traits
    if (Array.isArray(parsed.traits) && parsed.traits.length) {
        entry.trait = mapEntries(parsed.traits);
    }
    // Actions
    if (Array.isArray(parsed.actions) && parsed.actions.length) {
        entry.action = mapEntries(parsed.actions);
    }
    // Bonus actions
    if (Array.isArray(parsed.bonus_actions) && parsed.bonus_actions.length) {
        entry.bonus = mapEntries(parsed.bonus_actions);
    }
    // Reactions
    if (Array.isArray(parsed.reactions) && parsed.reactions.length) {
        entry.reaction = mapEntries(parsed.reactions);
    }
    // Legendary actions
    if (Array.isArray(parsed.legendary_actions) && parsed.legendary_actions.length) {
        entry.legendary = mapEntries(parsed.legendary_actions);
        entry.legendaryActions = 3;
    }
    return entry;
}
export class CreatureImportTools {
    foundryClient;
    logger;
    constructor({ foundryClient, logger }) {
        this.foundryClient = foundryClient;
        this.logger = logger.child({ component: 'CreatureImportTools' });
    }
    getToolDefinitions() {
        return [
            {
                name: 'import-creature-from-vault',
                description: 'Import a homebrew creature from an Obsidian vault note into Foundry VTT. Reads the statblock codeblock from the note, converts it to 5etools format, and imports via Plutonium (plutonium-addon-automation handles Midi-QOL, CPR, and DAE wiring automatically). Use when the user wants to bring a vault bestiary creature into Foundry.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Absolute path to the vault .md file (e.g. "D:/PKM/World Building/Rifted Campaign/00_My Notes/Bestiary/Blightsnake.md")',
                        },
                        addToScene: {
                            type: 'boolean',
                            description: 'Whether to place the created actor on the current scene as a token',
                            default: false,
                        },
                        quantity: {
                            type: 'number',
                            description: 'Number of tokens to place if addToScene is true (default: 1)',
                            default: 1,
                        },
                    },
                    required: ['filePath'],
                },
            },
        ];
    }
    async handleImportCreatureFromVault(args) {
        const schema = z.object({
            filePath: z.string(),
            addToScene: z.boolean().optional().default(false),
            quantity: z.number().optional().default(1),
        });
        const { filePath, addToScene, quantity } = schema.parse(args);
        if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
            throw new Error('quantity must be a finite positive integer no greater than 20');
        }
        // Read vault file
        let markdown;
        try {
            markdown = readFileSync(filePath, 'utf-8');
            if (markdown.charCodeAt(0) === 0xFEFF)
                markdown = markdown.slice(1); // strip BOM
        }
        catch (err) {
            throw new Error(`Could not read file: ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
        }
        // Extract statblock codeblock
        const rawYaml = extractStatblockYaml(markdown);
        if (!rawYaml)
            throw new Error(`No statblock codeblock found in: ${filePath}`);
        // Parse to 5etools JSON
        let entry;
        try {
            entry = parseStatblock(rawYaml);
        }
        catch (err) {
            throw new Error(`Failed to parse statblock: ${err instanceof Error ? err.message : String(err)}`);
        }
        this.logger.info('Importing creature to Foundry via Plutonium', { name: entry.name, cr: entry.cr });
        const result = await this.foundryClient.query('foundry-mcp-bridge.importCreatureFromJson', {
            entry,
            addToScene,
            quantity,
        });
        if (result?.success === false) {
            throw new Error(result.error ?? 'importCreatureFromJson failed');
        }
        const actorId = result?.actorId ?? 'unknown';
        const placed = addToScene ? ` Placed ${quantity} token(s) on scene.` : '';
        return `Imported "${entry.name}" (CR ${entry.cr}) into Foundry.${placed} Actor ID: ${actorId}`;
    }
}
//# sourceMappingURL=creature-import.js.map