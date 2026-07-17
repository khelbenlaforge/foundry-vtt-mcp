import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { ComfyUIManager } from './comfyui-manager.js';
const ALLOWED_RECOVERY_PERIODS = ['lr', 'sr', 'day'];
export class QueryHandlers {
    dataAccess;
    comfyuiManager;
    constructor() {
        this.dataAccess = new FoundryDataAccess();
        this.comfyuiManager = new ComfyUIManager();
    }
    /**
     * SECURITY: Validate GM access - returns silent failure for non-GM users
     */
    validateGMAccess() {
        if (!game.user?.isGM) {
            // Silent failure - no error message for non-GM users
            return { allowed: false };
        }
        return { allowed: true };
    }
    /**
     * Register all query handlers in CONFIG.queries
     */
    registerHandlers() {
        const modulePrefix = MODULE_ID;
        // Character/Actor queries
        CONFIG.queries[`${modulePrefix}.getCharacterInfo`] = this.handleGetCharacterInfo.bind(this);
        CONFIG.queries[`${modulePrefix}.listActors`] = this.handleListActors.bind(this);
        // Compendium queries
        CONFIG.queries[`${modulePrefix}.searchCompendium`] = this.handleSearchCompendium.bind(this);
        CONFIG.queries[`${modulePrefix}.listCreaturesByCriteria`] = this.handleListCreaturesByCriteria.bind(this);
        CONFIG.queries[`${modulePrefix}.getAvailablePacks`] = this.handleGetAvailablePacks.bind(this);
        // Scene queries
        CONFIG.queries[`${modulePrefix}.getActiveScene`] = this.handleGetActiveScene.bind(this);
        CONFIG.queries[`${modulePrefix}.list-scenes`] = this.handleListScenes.bind(this);
        CONFIG.queries[`${modulePrefix}.switch-scene`] = this.handleSwitchScene.bind(this);
        // World queries
        CONFIG.queries[`${modulePrefix}.getWorldInfo`] = this.handleGetWorldInfo.bind(this);
        // Utility queries
        CONFIG.queries[`${modulePrefix}.ping`] = this.handlePing.bind(this);
        // Phase 2 & 3: Write operation queries
        CONFIG.queries[`${modulePrefix}.createActorFromCompendium`] = this.handleCreateActorFromCompendium.bind(this);
        CONFIG.queries[`${modulePrefix}.getCompendiumDocumentFull`] = this.handleGetCompendiumDocumentFull.bind(this);
        CONFIG.queries[`${modulePrefix}.addActorsToScene`] = this.handleAddActorsToScene.bind(this);
        CONFIG.queries[`${modulePrefix}.validateWritePermissions`] = this.handleValidateWritePermissions.bind(this);
        CONFIG.queries[`${modulePrefix}.createJournalEntry`] = this.handleCreateJournalEntry.bind(this);
        CONFIG.queries[`${modulePrefix}.listJournals`] = this.handleListJournals.bind(this);
        CONFIG.queries[`${modulePrefix}.getJournalContent`] = this.handleGetJournalContent.bind(this);
        CONFIG.queries[`${modulePrefix}.getJournalPageContent`] = this.handleGetJournalPageContent.bind(this);
        CONFIG.queries[`${modulePrefix}.updateJournalContent`] = this.handleUpdateJournalContent.bind(this);
        // Phase 4: Dice roll queries
        CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);
        // Enhanced creature index for campaign analysis
        CONFIG.queries[`${modulePrefix}.getEnhancedCreatureIndex`] = this.handleGetEnhancedCreatureIndex.bind(this);
        // Campaign management queries
        CONFIG.queries[`${modulePrefix}.updateCampaignProgress`] = this.handleUpdateCampaignProgress.bind(this);
        // Phase 6: Actor ownership management
        CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
        CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
        CONFIG.queries[`${modulePrefix}.getFriendlyNPCs`] = this.handleGetFriendlyNPCs.bind(this);
        CONFIG.queries[`${modulePrefix}.getPartyCharacters`] = this.handleGetPartyCharacters.bind(this);
        CONFIG.queries[`${modulePrefix}.getConnectedPlayers`] = this.handleGetConnectedPlayers.bind(this);
        CONFIG.queries[`${modulePrefix}.findPlayers`] = this.handleFindPlayers.bind(this);
        CONFIG.queries[`${modulePrefix}.findActor`] = this.handleFindActor.bind(this);
        // Generic actor CRUD (any actor type — create/update/delete actors and embedded items)
        CONFIG.queries[`${modulePrefix}.createActors`] = this.handleCreateActors.bind(this);
        CONFIG.queries[`${modulePrefix}.updateActors`] = this.handleUpdateActors.bind(this);
        CONFIG.queries[`${modulePrefix}.deleteActors`] = this.handleDeleteActors.bind(this);
        CONFIG.queries[`${modulePrefix}.updateActorItems`] = this.handleUpdateActorItems.bind(this);
        CONFIG.queries[`${modulePrefix}.deleteActorItems`] = this.handleDeleteActorItems.bind(this);
        CONFIG.queries[`${modulePrefix}.addActorItems`] = this.handleAddActorItems.bind(this);
        CONFIG.queries[`${modulePrefix}.removeActorItems`] = this.handleRemoveActorItems.bind(this);
        CONFIG.queries[`${modulePrefix}.createWorldItems`] = this.handleCreateWorldItems.bind(this);
        CONFIG.queries[`${modulePrefix}.listWorldItems`] = this.handleListWorldItems.bind(this);
        CONFIG.queries[`${modulePrefix}.updateWorldItems`] = this.handleUpdateWorldItems.bind(this);
        // Token manipulation queries
        CONFIG.queries[`${modulePrefix}.moveToken`] = this.handleMoveToken.bind(this);
        CONFIG.queries[`${modulePrefix}.updateToken`] = this.handleUpdateToken.bind(this);
        CONFIG.queries[`${modulePrefix}.deleteTokens`] = this.handleDeleteTokens.bind(this);
        CONFIG.queries[`${modulePrefix}.getTokenDetails`] = this.handleGetTokenDetails.bind(this);
        CONFIG.queries[`${modulePrefix}.toggleTokenCondition`] = this.handleToggleTokenCondition.bind(this);
        CONFIG.queries[`${modulePrefix}.getAvailableConditions`] = this.handleGetAvailableConditions.bind(this);
        // Map generation queries (hybrid architecture)
        CONFIG.queries[`${modulePrefix}.generate-map`] = this.handleGenerateMap.bind(this);
        CONFIG.queries[`${modulePrefix}.check-map-status`] = this.handleCheckMapStatus.bind(this);
        CONFIG.queries[`${modulePrefix}.cancel-map-job`] = this.handleCancelMapJob.bind(this);
        CONFIG.queries[`${modulePrefix}.upload-generated-map`] = this.handleUploadGeneratedMap.bind(this);
        // Plutonium creature import
        CONFIG.queries[`${modulePrefix}.importCreatureFromJson`] = this.handleImportCreatureFromJson.bind(this);
        CONFIG.queries[`${modulePrefix}.addItemToActor`] = this.handleAddItemToActor.bind(this);
        CONFIG.queries[`${modulePrefix}.addSpellToActor`] = this.handleAddSpellToActor.bind(this);
        // Item usage queries
        CONFIG.queries[`${modulePrefix}.useItem`] = this.handleUseItem.bind(this);
        // Character search queries
        CONFIG.queries[`${modulePrefix}.searchCharacterItems`] = this.handleSearchCharacterItems.bind(this);
        // Phase 7: Token manipulation queries
        CONFIG.queries[`${modulePrefix}.move-token`] = this.handleMoveToken.bind(this);
        CONFIG.queries[`${modulePrefix}.update-token`] = this.handleUpdateToken.bind(this);
        CONFIG.queries[`${modulePrefix}.delete-tokens`] = this.handleDeleteTokens.bind(this);
        CONFIG.queries[`${modulePrefix}.get-token-details`] = this.handleGetTokenDetails.bind(this);
        CONFIG.queries[`${modulePrefix}.toggle-token-condition`] = this.handleToggleTokenCondition.bind(this);
        CONFIG.queries[`${modulePrefix}.get-available-conditions`] = this.handleGetAvailableConditions.bind(this);
    }
    /**
     * Unregister all query handlers
     */
    unregisterHandlers() {
        const modulePrefix = MODULE_ID;
        const keysToRemove = Object.keys(CONFIG.queries).filter(key => key.startsWith(modulePrefix));
        for (const key of keysToRemove) {
            delete CONFIG.queries[key];
        }
    }
    /**
     * Handle query requests from other parts of the module
     */
    async handleQuery(queryName, data) {
        try {
            const handler = CONFIG.queries[queryName];
            if (!handler || typeof handler !== 'function') {
                throw new Error(`Query handler not found: ${queryName}`);
            }
            return await handler(data);
        }
        catch (error) {
            console.error(`[${MODULE_ID}] Query failed: ${queryName}`, error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            };
        }
    }
    /**
     * Handle character information request
     */
    async handleGetCharacterInfo(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            const identifier = data.characterName || data.characterId;
            if (!identifier) {
                throw new Error('characterName or characterId is required');
            }
            return await this.dataAccess.getCharacterInfo(identifier);
        }
        catch (error) {
            throw new Error(`Failed to get character info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle list actors request
     */
    async handleListActors(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            const actors = await this.dataAccess.listActors();
            // Filter by type if specified
            if (data.type) {
                return actors.filter(actor => actor.type === data.type);
            }
            return actors;
        }
        catch (error) {
            throw new Error(`Failed to list actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle compendium search request
     */
    async handleSearchCompendium(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            // Add better parameter validation
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data parameter structure');
            }
            if (!data.query || typeof data.query !== 'string') {
                throw new Error('query parameter is required and must be a string');
            }
            return await this.dataAccess.searchCompendium(data.query, data.packType, data.filters);
        }
        catch (error) {
            throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle list creatures by criteria request
     */
    async handleListCreaturesByCriteria(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            const result = await this.dataAccess.listCreaturesByCriteria(data);
            // Handle the new format with search summary
            return {
                response: result
            };
        }
        catch (error) {
            throw new Error(`Failed to list creatures by criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get available packs request
     */
    async handleGetAvailablePacks() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getAvailablePacks();
        }
        catch (error) {
            throw new Error(`Failed to get available packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get active scene request
     */
    async handleGetActiveScene() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getActiveScene();
        }
        catch (error) {
            throw new Error(`Failed to get active scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get world info request
     */
    async handleGetWorldInfo() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getWorldInfo();
        }
        catch (error) {
            throw new Error(`Failed to get world info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle ping request
     */
    async handlePing() {
        return {
            status: 'ok',
            timestamp: Date.now(),
            module: MODULE_ID,
            foundryVersion: game.version,
            worldId: game.world?.id,
            userId: game.user?.id,
        };
    }
    /**
     * Get list of all registered query methods
     */
    getRegisteredMethods() {
        const modulePrefix = MODULE_ID;
        return Object.keys(CONFIG.queries)
            .filter(key => key.startsWith(modulePrefix))
            .map(key => key.replace(`${modulePrefix}.`, ''));
    }
    /**
     * Test if a specific query handler is registered
     */
    isMethodRegistered(method) {
        const queryKey = `${MODULE_ID}.${method}`;
        return queryKey in CONFIG.queries && typeof CONFIG.queries[queryKey] === 'function';
    }
    // ===== PLUTONIUM IMPORT =====
    /**
     * Import a creature from 5etools JSON via Plutonium's importer.
     * plutonium-addon-automation handles Midi-QOL / CPR / DAE wiring automatically.
     */
    async handleImportCreatureFromJson(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed)
                return { error: 'Access denied', success: false };
            this.dataAccess.validateFoundryState();
            const plutonium = game.modules?.get('plutonium');
            if (!plutonium?.active) {
                return { error: 'Plutonium module is not active', success: false };
            }
            const creatureImporter = plutonium?.api?.importer?.creature;
            if (!creatureImporter?.pImportEntry) {
                return { error: 'Plutonium creature importer not available — is Foundry fully loaded?', success: false };
            }
            // Plutonium import — plutonium-addon-automation fires automatically on the created actor
            const importResult = await creatureImporter.pImportEntry(data.entry);
            // pImportEntry may return the actor directly or wrap it
            const actor = importResult?.actor ?? importResult;
            const actorId = actor?.id ?? null;
            if (!actorId) {
                return { success: false, error: 'Plutonium import returned no actor ID' };
            }
            // Optionally place token(s) on the active scene
            if (data.addToScene && actorId && canvas?.scene) {
                const qty = Math.max(1, data.quantity ?? 1);
                const tokenDataArr = Array.from({ length: qty }, (_, i) => ({
                    actorId,
                    x: 100 + i * 100,
                    y: 100,
                }));
                await canvas.scene.createEmbeddedDocuments('Token', tokenDataArr);
            }
            return { success: true, actorId };
        }
        catch (error) {
            throw new Error(`importCreatureFromJson failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    buildActivityUses(uses) {
        if (!uses)
            return undefined;
        return {
            spent: uses.max - uses.value,
            max: String(uses.max),
            recovery: [{ period: uses.recovery, type: 'recoverAll' }],
        };
    }
    buildActivity(input, itemName) {
        const id = foundry.utils.randomID();
        const activity = {
            _id: id,
            type: input.type,
            name: `${itemName}: ${input.name}`,
            activation: {
                type: input.activation?.type ?? 'action',
                value: input.activation?.value ?? null,
            },
            description: { value: input.description ?? '' },
            duration: { value: null, units: 'inst' },
            range: input.range ?? {},
            target: input.target
                ? { affects: { count: input.target.count, type: input.target.type }, prompt: true }
                : { affects: {}, prompt: true },
        };
        const uses = this.buildActivityUses(input.uses);
        if (uses) {
            activity.uses = uses;
            activity.consumption = {
                targets: [{ type: 'activityUses', target: '', value: '1' }],
                scaling: { allowed: false },
            };
        }
        const toDamagePart = (part) => ({
            number: part.number,
            denomination: part.denomination,
            bonus: part.bonus ?? '',
            types: part.types ?? [],
            custom: { enabled: false, formula: '' },
            scaling: { mode: 'whole', number: 1 },
        });
        switch (input.type) {
            case 'attack':
                activity.attack = {
                    ability: input.attack?.ability || undefined,
                    bonus: input.attack?.bonus ?? '',
                    critical: {},
                    flat: false,
                    type: { value: input.attack?.attackType ?? 'melee', classification: input.attack?.classification ?? 'weapon' },
                };
                if (input.damageParts?.length) {
                    activity.damage = { critical: {}, includeBase: false, parts: input.damageParts.map(toDamagePart) };
                }
                break;
            case 'damage':
                activity.damage = { critical: {}, includeBase: false, parts: (input.damageParts ?? []).map(toDamagePart) };
                break;
            case 'save':
                activity.save = {
                    ability: input.save.ability,
                    dc: typeof input.save.dc === 'number' ? { calculation: '', formula: String(input.save.dc) } : { calculation: input.save.dc, formula: '' },
                };
                activity.damage = { onSave: input.save.onSave ?? 'half', parts: (input.damageParts ?? []).map(toDamagePart) };
                break;
            case 'heal':
                activity.healing = {
                    number: input.healing.number,
                    denomination: input.healing.denomination,
                    bonus: input.healing.bonus ?? '',
                    types: ['healing'],
                    custom: { enabled: false, formula: '' },
                    scaling: { mode: 'whole', number: 1 },
                };
                break;
            case 'utility':
                activity.roll = { formula: input.roll.formula, name: input.roll.name ?? '', prompt: true, visible: true };
                break;
        }
        return [id, activity];
    }
    buildPassiveEffectChanges(input) {
        const ADD = 2;
        const UPGRADE = 4;
        const OVERRIDE = 5;
        const v = (val) => String(val);
        const table = {
            attack_bonus_mwak: () => [{ key: 'system.bonuses.mwak.attack', mode: ADD, value: v(input.value) }],
            attack_bonus_rwak: () => [{ key: 'system.bonuses.rwak.attack', mode: ADD, value: v(input.value) }],
            damage_bonus_mwak: () => [{ key: 'system.bonuses.mwak.damage', mode: ADD, value: v(input.value) }],
            damage_bonus_rwak: () => [{ key: 'system.bonuses.rwak.damage', mode: ADD, value: v(input.value) }],
            ability_check_bonus: () => [{ key: 'system.bonuses.abilities.check', mode: ADD, value: v(input.value) }],
            save_bonus: () => [{ key: 'system.bonuses.abilities.save', mode: ADD, value: v(input.value) }],
            skill_check_bonus: () => [{ key: 'system.bonuses.abilities.skill', mode: ADD, value: v(input.value) }],
            spell_dc_bonus: () => [{ key: 'system.bonuses.spell.dc', mode: ADD, value: v(input.value) }],
            // UPGRADE (not OVERRIDE) so an actor who already has expertise in this skill isn't downgraded to plain proficiency.
            skill_proficiency: () => [{ key: `system.skills.${input.target}.value`, mode: UPGRADE, value: 1 }],
            skill_expertise: () => [{ key: `system.skills.${input.target}.value`, mode: UPGRADE, value: 2 }],
            damage_resistance: () => [{ key: 'system.traits.dr.value', mode: ADD, value: v(input.value) }],
            damage_immunity: () => [{ key: 'system.traits.di.value', mode: ADD, value: v(input.value) }],
            damage_vulnerability: () => [{ key: 'system.traits.dv.value', mode: ADD, value: v(input.value) }],
            condition_immunity: () => [{ key: 'system.traits.ci.value', mode: ADD, value: v(input.value) }],
            language: () => [{ key: 'system.traits.languages.value', mode: ADD, value: v(input.value) }],
            size: () => [{ key: 'system.traits.size', mode: OVERRIDE, value: v(input.value) }],
            movement_speed: () => [{ key: `system.attributes.movement.${input.target ?? 'walk'}`, mode: OVERRIDE, value: input.value }],
            movement_hover: () => [{ key: 'system.attributes.movement.hover', mode: OVERRIDE, value: input.value }],
            sense_range: () => [{ key: `system.attributes.senses.ranges.${input.target}`, mode: OVERRIDE, value: input.value }],
            hp_bonus_flat: () => [{ key: 'system.attributes.hp.bonuses.overall', mode: ADD, value: v(input.value) }],
            hp_bonus_per_level: () => [{ key: 'system.attributes.hp.bonuses.level', mode: ADD, value: v(input.value) }],
            ac_formula: () => [
                { key: 'system.attributes.ac.calc', mode: OVERRIDE, value: 'custom' },
                { key: 'system.attributes.ac.formula', mode: OVERRIDE, value: v(input.value) },
            ],
            initiative_advantage: () => [{ key: 'flags.dnd5e.initiativeAdv', mode: OVERRIDE, value: input.value }],
            reroll_ones: () => [{ key: 'flags.dnd5e.halflingLucky', mode: OVERRIDE, value: input.value }],
            reroll_lowest_advantage: () => [{ key: 'flags.dnd5e.elvenAccuracy', mode: OVERRIDE, value: input.value }],
            crit_threshold: () => [{ key: 'flags.dnd5e.weaponCriticalThreshold', mode: OVERRIDE, value: input.value }],
            crit_extra_dice: () => [{ key: 'flags.dnd5e.meleeCriticalDamageDice', mode: ADD, value: v(input.value) }],
        };
        const build = table[input.passiveType];
        if (!build)
            throw new Error(`Unknown passiveType: ${input.passiveType}`);
        return build().map((change) => ({ ...change, priority: change.mode === OVERRIDE ? 20 : undefined }));
    }
    async handleAddItemToActor(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed)
                return { error: 'Access denied', success: false };
            this.dataAccess.validateFoundryState();
            const actors = game.actors;
            let actor = actors?.get(data.actorIdentifier) ?? null;
            if (!actor) {
                const nameMatches = actors?.filter((candidate) => candidate.name === data.actorIdentifier) ?? [];
                if (nameMatches.length > 1) {
                    return {
                        error: `Actor identifier is ambiguous: ${nameMatches.map((candidate) => candidate.name).join(', ')}`,
                        success: false,
                    };
                }
                actor = nameMatches[0] ?? null;
            }
            if (!actor) {
                return { error: `Actor not found: ${data.actorIdentifier}`, success: false };
            }
            // Map recovery period to dnd5e v5 recovery array format
            const recoveryMap = { lr: 'lr', sr: 'sr', day: 'day' };
            if (data.uses && !ALLOWED_RECOVERY_PERIODS.includes(data.uses.recovery)) {
                return { error: `Invalid uses.recovery: ${data.uses.recovery}`, success: false };
            }
            const recoveryPeriod = data.uses ? recoveryMap[data.uses.recovery] : 'lr';
            const itemType = data.type ?? 'feat';
            const hasPassives = !!data.passiveEffects?.length;
            const isEquippable = itemType === 'equipment' || itemType === 'weapon';
            const itemData = {
                name: data.name,
                type: itemType,
                system: {
                    description: { value: data.description },
                    quantity: data.quantity ?? 1,
                    ...(data.rarity ? { rarity: data.rarity } : {}),
                    ...(data.uses ? {
                        uses: {
                            value: data.uses.value,
                            max: String(data.uses.max),
                            recovery: [{ period: recoveryPeriod, type: 'recoverAll' }],
                        },
                    } : {}),
                    // Equip/attunement gating: dnd5e suppresses transfer effects on
                    // equipment/weapon items unless equipped (and attuned, if required).
                    ...(isEquippable ? {
                        equipped: data.equipped ?? (hasPassives ? true : false),
                        // Attunement is a magic-item-only mechanic in dnd5e; the system couples the
                        // attunement UI/data to the "mgc" (magical) properties flag.
                        ...(data.requiresAttunement ? { attunement: 'required', attuned: true, properties: ['mgc'] } : {}),
                    } : {}),
                },
            };
            if (data.activities?.length) {
                const activities = {};
                for (const activityInput of data.activities) {
                    const [id, activity] = this.buildActivity(activityInput, data.name);
                    activities[id] = activity;
                }
                itemData.system.activities = activities;
            }
            if (hasPassives) {
                itemData.effects = data.passiveEffects.map((passiveInput) => ({
                    name: `${data.name}: ${passiveInput.name}`,
                    changes: this.buildPassiveEffectChanges(passiveInput),
                    transfer: true,
                    disabled: false,
                }));
            }
            const created = await actor.createEmbeddedDocuments('Item', [itemData]);
            const createdItem = created?.[0] ?? null;
            const itemId = createdItem?.id ?? null;
            if (!itemId) {
                return { success: false, error: 'Foundry createEmbeddedDocuments returned no item ID' };
            }
            // The parent item now exists on the actor regardless of what happens below — a failure in
            // origin-patching or stub creation must not be reported as a total failure (the caller would
            // otherwise assume no item was created and could retry, duplicating it).
            const stubItemIds = [];
            let warning;
            try {
                // Effects can't reference their own item's UUID before the item exists — patch origin post-creation.
                if (hasPassives && createdItem.effects?.size) {
                    const effectUpdates = createdItem.effects.map((effect) => ({ _id: effect.id, origin: createdItem.uuid }));
                    await createdItem.updateEmbeddedDocuments('ActiveEffect', effectUpdates);
                }
                if (data.inertAbilities?.length) {
                    const stubData = data.inertAbilities.map((ability) => ({
                        name: `${data.name}: ${ability.name}`,
                        type: 'feat',
                        system: { description: { value: ability.description } },
                    }));
                    const createdStubs = await actor.createEmbeddedDocuments('Item', stubData);
                    for (const stub of createdStubs)
                        stubItemIds.push(stub.id);
                }
            }
            catch (error) {
                warning = `Item "${data.name}" was created (${itemId}), but a follow-up step failed: ${error instanceof Error ? error.message : String(error)}. Effect origin or inert stubs may be incomplete — check the item on the actor.`;
            }
            return { success: true, itemId, actorId: actor.id, stubItemIds, ...(warning ? { warning } : {}) };
        }
        catch (error) {
            throw new Error(`addItemToActor failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    resolveActor(actorIdentifier) {
        const actors = game.actors;
        let actor = actors?.get(actorIdentifier) ?? null;
        if (!actor) {
            const nameMatches = actors?.filter((candidate) => candidate.name === actorIdentifier) ?? [];
            if (nameMatches.length > 1) {
                return { actor: null, error: `Actor identifier is ambiguous: ${nameMatches.map((candidate) => candidate.name).join(', ')}` };
            }
            actor = nameMatches[0] ?? null;
        }
        if (!actor) {
            return { actor: null, error: `Actor not found: ${actorIdentifier}` };
        }
        return { actor };
    }
    async handleAddSpellToActor(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed)
                return { error: 'Access denied', success: false };
            this.dataAccess.validateFoundryState();
            const { actor, error } = this.resolveActor(data.actorIdentifier);
            if (!actor)
                return { error, success: false };
            const components = data.components ?? [];
            const itemData = {
                name: data.name,
                type: 'spell',
                system: {
                    description: { value: data.description },
                    level: data.level,
                    school: data.school,
                    method: 'spell',
                    prepared: data.prepared ?? false,
                    activation: {
                        type: data.activation?.type ?? 'action',
                        value: data.activation?.value ?? null,
                        condition: data.activation?.condition ?? '',
                    },
                    duration: {
                        value: data.duration?.value ?? null,
                        units: data.duration?.units ?? 'inst',
                        // "concentration" in components is the authoritative source unless the caller overrides explicitly.
                        concentration: data.duration?.concentration ?? components.includes('concentration'),
                    },
                    range: {
                        value: data.range?.value ?? null,
                        units: data.range?.units ?? 'ft',
                    },
                    target: data.target
                        ? { affects: { count: data.target.count, type: data.target.type } }
                        : { affects: {} },
                    properties: components,
                    materials: {
                        value: data.materials?.value ?? '',
                        consumed: data.materials?.consumed ?? false,
                        cost: data.materials?.cost ?? 0,
                        supply: 0,
                    },
                },
            };
            // Spell-slot consumption for cast activities needs no manual wiring: dnd5e's Activity schema
            // defaults consumption.spellSlot to true and requiresSpellSlot is derived automatically from
            // the parent item being a leveled spell (confirmed 2026-07-02 against a real compendium spell's
            // consumption dump: {spellSlot: true, targets: []} — empty targets, no scaling override).
            // Adding an explicit "spellSlots" consumption target on top of that duplicated the checkbox.
            if (data.activities?.length) {
                const activities = {};
                for (const activityInput of data.activities) {
                    // buildActivity() is shared with add-item-to-actor, where "weapon" is the sensible default
                    // attack classification. For a spell's own casting activity, default to "spell" instead
                    // unless the caller explicitly asked for something else (e.g. a weapon-replacing cantrip).
                    const normalizedInput = activityInput.type === 'attack'
                        ? { ...activityInput, attack: { classification: 'spell', ...activityInput.attack } }
                        : activityInput;
                    const [id, activity] = this.buildActivity(normalizedInput, data.name);
                    activities[id] = activity;
                }
                itemData.system.activities = activities;
            }
            const created = await actor.createEmbeddedDocuments('Item', [itemData]);
            const createdItem = created?.[0] ?? null;
            const itemId = createdItem?.id ?? null;
            if (!itemId) {
                return { success: false, error: 'Foundry createEmbeddedDocuments returned no item ID' };
            }
            // The properties SetField is validated against CONFIG.DND5E.validProperties[type] during
            // document clean — at createEmbeddedDocuments time the type isn't reliably resolved yet, so
            // component tags passed at creation get silently dropped (confirmed 2026-07-02: only the
            // system-derived "mgc" tag survives, none of the caller's vocal/somatic/etc.). Patch it in as
            // a follow-up update, once the item fully exists.
            // UNRESOLVED, DOCUMENTED LIMITATION (see .claude/skills/foundry-item-import/SKILL.md Step 8 in
            // the World Building vault) — every patch strategy tried still silently no-ops when called from
            // this handler, even though the identical call works when typed manually in the console against
            // an already-existing item: `createdItem.update()` (the create-returned ref),
            // `actor.updateEmbeddedDocuments()` with a bare _id, a freshly-fetched
            // `actor.items.get(itemId).update()`, and the same fresh-fetch with a 250ms settle delay first
            // (the delay did NOT fix it, despite what an earlier version of this comment claimed — do not
            // trust that the delay helps). No code-level cause was found on adversarial review of the
            // CONFIG.queries dispatch path (queries.ts registration, handleQuery, socket-bridge.js) — it
            // looks like a Foundry document-lifecycle quirk, not a bug in this handler's dispatch.
            // Because the failure is a *silent* no-op (no exception), verify by reading the value back
            // rather than trusting an absence of thrown errors — see the readback check below.
            let warning;
            if (components.length) {
                try {
                    const freshItem = actor.items.get(itemId);
                    await freshItem.update({ 'system.properties': components });
                    const persisted = new Set(freshItem.system.properties ?? []);
                    const missing = components.filter((c) => !persisted.has(c));
                    if (missing.length) {
                        warning = `Item "${data.name}" was created (${itemId}), but these components did not persist: ${missing.join(', ')}. This is a known unresolved issue — tick the Components checkboxes on the sheet manually.`;
                    }
                }
                catch (error) {
                    warning = `Item "${data.name}" was created (${itemId}), but setting spell components failed: ${error instanceof Error ? error.message : String(error)}. Check the Components field on the sheet.`;
                }
            }
            return { success: true, itemId, actorId: actor.id, ...(warning ? { warning } : {}) };
        }
        catch (error) {
            throw new Error(`addSpellToActor failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ===== PHASE 2: WRITE OPERATION HANDLERS =====
    /**
     * Handle actor creation from specific compendium entry
     */
    async handleCreateActorFromCompendium(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            // Clean interface - direct pack/item reference only
            const requestData = {
                packId: data.packId,
                itemId: data.itemId,
                customNames: data.customNames || [],
                quantity: data.quantity || 1,
                addToScene: data.addToScene || false,
            };
            if (data.placement) {
                requestData.placement = data.placement;
            }
            return await this.dataAccess.createActorFromCompendiumEntry(requestData);
        }
        catch (error) {
            throw new Error(`Failed to create actor from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get compendium document full request
     */
    async handleGetCompendiumDocumentFull(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.packId) {
                throw new Error('packId is required');
            }
            if (!data.documentId) {
                throw new Error('documentId is required');
            }
            return await this.dataAccess.getCompendiumDocumentFull(data.packId, data.documentId);
        }
        catch (error) {
            throw new Error(`Failed to get compendium document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle add actors to scene request
     */
    async handleAddActorsToScene(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.actorIds || !Array.isArray(data.actorIds) || data.actorIds.length === 0) {
                throw new Error('actorIds array is required and must not be empty');
            }
            return await this.dataAccess.addActorsToScene({
                actorIds: data.actorIds,
                placement: data.placement || 'random',
                hidden: data.hidden || false,
            });
        }
        catch (error) {
            throw new Error(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle validate write permissions request
     */
    async handleValidateWritePermissions(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.operation) {
                throw new Error('operation is required');
            }
            return await this.dataAccess.validateWritePermissions(data.operation);
        }
        catch (error) {
            throw new Error(`Failed to validate write permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle journal entry creation
     */
    async handleCreateJournalEntry(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            if (!data.name) {
                throw new Error('name is required');
            }
            if (!data.content) {
                throw new Error('content is required');
            }
            return await this.dataAccess.createJournalEntry({
                name: data.name,
                content: data.content,
                additionalPages: data.additionalPages,
            });
        }
        catch (error) {
            throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle list journals request
     */
    async handleListJournals() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.listJournals();
        }
        catch (error) {
            throw new Error(`Failed to list journals: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get journal content request
     */
    async handleGetJournalContent(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.journalId) {
                throw new Error('journalId is required');
            }
            return await this.dataAccess.getJournalContent(data.journalId);
        }
        catch (error) {
            throw new Error(`Failed to get journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get specific journal page content request
     */
    async handleGetJournalPageContent(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.journalId) {
                throw new Error('journalId is required');
            }
            if (!data.pageId) {
                throw new Error('pageId is required');
            }
            return await this.dataAccess.getJournalPageContent(data.journalId, data.pageId);
        }
        catch (error) {
            throw new Error(`Failed to get journal page content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle update journal content request
     */
    async handleUpdateJournalContent(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.journalId) {
                throw new Error('journalId is required');
            }
            if (!data.content) {
                throw new Error('content is required');
            }
            const updateRequest = {
                journalId: data.journalId,
                content: data.content,
            };
            if (data.pageId)
                updateRequest.pageId = data.pageId;
            if (data.newPageName)
                updateRequest.newPageName = data.newPageName;
            return await this.dataAccess.updateJournalContent(updateRequest);
        }
        catch (error) {
            throw new Error(`Failed to update journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle request player rolls - creates interactive roll buttons in chat
     */
    async handleRequestPlayerRolls(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.rollType || !data.rollTarget || !data.targetPlayer) {
                throw new Error('rollType, rollTarget, and targetPlayer are required');
            }
            return await this.dataAccess.requestPlayerRolls(data);
        }
        catch (error) {
            throw new Error(`Failed to request player rolls: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get enhanced creature index request
     */
    async handleGetEnhancedCreatureIndex() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getEnhancedCreatureIndex();
        }
        catch (error) {
            throw new Error(`Failed to get enhanced creature index: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle campaign progress update request
     */
    async handleUpdateCampaignProgress(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            // For now, this is a pass-through to the MCP server
            // In the future, campaign data might be stored in Foundry world flags
            // Currently, the campaign dashboard regeneration happens server-side
            return {
                success: true,
                message: `Campaign progress updated: ${data.partId} is now ${data.newStatus}`,
                campaignId: data.campaignId,
                partId: data.partId,
                newStatus: data.newStatus
            };
        }
        catch (error) {
            throw new Error(`Failed to update campaign progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle set actor ownership request
     */
    async handleSetActorOwnership(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.actorId || !data.userId || data.permission === undefined) {
                throw new Error('actorId, userId, and permission are required');
            }
            return await this.dataAccess.setActorOwnership(data);
        }
        catch (error) {
            throw new Error(`Failed to set actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get actor ownership request
     */
    async handleGetActorOwnership(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getActorOwnership(data);
        }
        catch (error) {
            throw new Error(`Failed to get actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get friendly NPCs request
     */
    async handleGetFriendlyNPCs() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getFriendlyNPCs();
        }
        catch (error) {
            throw new Error(`Failed to get friendly NPCs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get party characters request
     */
    async handleGetPartyCharacters() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getPartyCharacters();
        }
        catch (error) {
            throw new Error(`Failed to get party characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get connected players request
     */
    async handleGetConnectedPlayers() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getConnectedPlayers();
        }
        catch (error) {
            throw new Error(`Failed to get connected players: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle find players request
     */
    async handleFindPlayers(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.identifier) {
                throw new Error('identifier is required');
            }
            return await this.dataAccess.findPlayers(data);
        }
        catch (error) {
            throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle find actor request
     */
    async handleFindActor(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.identifier) {
                throw new Error('identifier is required');
            }
            return await this.dataAccess.findActor(data);
        }
        catch (error) {
            throw new Error(`Failed to find actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle list scenes request
     */
    async handleListScenes(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.listScenes(data);
        }
        catch (error) {
            throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle switch scene request
     */
    async handleSwitchScene(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.scene_identifier) {
                throw new Error('scene_identifier is required');
            }
            return await this.dataAccess.switchScene(data);
        }
        catch (error) {
            throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle map generation request - uses hybrid architecture
     */
    async handleGenerateMap(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            if (!data.prompt || typeof data.prompt !== 'string') {
                throw new Error('Prompt is required and must be a string');
            }
            if (!data.scene_name || typeof data.scene_name !== 'string') {
                throw new Error('Scene name is required and must be a string');
            }
            // Get quality setting from module settings
            const quality = game.settings.get(MODULE_ID, 'mapGenQuality') || 'low';
            const params = {
                prompt: data.prompt.trim(),
                scene_name: data.scene_name.trim(),
                size: data.size || 'medium',
                grid_size: data.grid_size || 70,
                quality: quality
            };
            // Use ComfyUIManager to communicate with backend via WebSocket
            const response = await this.comfyuiManager.generateMap(params);
            const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';
            if (!isSuccess) {
                const errorMessage = response?.error || response?.message || 'Map generation failed';
                return {
                    error: errorMessage,
                    success: false,
                    status: response?.status ?? 'error'
                };
            }
            return {
                success: true,
                status: response?.status ?? 'success',
                jobId: response.jobId,
                message: response.message || 'Map generation started',
                estimatedTime: response.estimatedTime || '30-90 seconds'
            };
        }
        catch (error) {
            return {
                error: error.message,
                success: false
            };
        }
    }
    /**
     * Handle map status check request - uses hybrid architecture
     */
    async handleCheckMapStatus(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            if (!data.job_id) {
                throw new Error('Job ID is required');
            }
            // Use ComfyUIManager to communicate with backend via WebSocket
            const response = await this.comfyuiManager.checkMapStatus(data);
            const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';
            if (!isSuccess) {
                const errorMessage = response?.error || response?.message || 'Status check failed';
                return {
                    error: errorMessage,
                    success: false,
                    status: response?.status ?? 'error'
                };
            }
            return {
                success: true,
                status: response?.status ?? 'success',
                job: response.job
            };
        }
        catch (error) {
            return {
                error: error.message,
                success: false
            };
        }
    }
    /**
     * Handle map job cancellation request - uses hybrid architecture
     */
    async handleCancelMapJob(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            if (!data.job_id) {
                throw new Error('Job ID is required');
            }
            // Use ComfyUIManager to communicate with backend via WebSocket
            const response = await this.comfyuiManager.cancelMapJob(data);
            const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';
            if (!isSuccess) {
                const errorMessage = response?.error || response?.message || 'Job cancellation failed';
                return {
                    error: errorMessage,
                    success: false,
                    status: response?.status ?? 'error'
                };
            }
            return {
                success: true,
                status: response?.status ?? 'success',
                message: response.message || 'Job cancelled successfully'
            };
        }
        catch (error) {
            return {
                error: error.message,
                success: false
            };
        }
    }
    /**
     * Handle upload of generated map image (for remote Foundry instances)
     * Receives base64-encoded image data and saves it to generated-maps folder
     */
    async handleUploadGeneratedMap(data) {
        console.log(`[${MODULE_ID}] Upload generated map request received`, {
            hasFilename: !!data.filename,
            hasImageData: !!data.imageData,
            imageDataLength: data.imageData?.length
        });
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                console.error(`[${MODULE_ID}] Upload denied - not GM`);
                return { error: 'Access denied', success: false };
            }
            if (!data.filename || typeof data.filename !== 'string') {
                console.error(`[${MODULE_ID}] Upload failed - invalid filename`);
                throw new Error('Filename is required and must be a string');
            }
            if (!data.imageData || typeof data.imageData !== 'string') {
                console.error(`[${MODULE_ID}] Upload failed - invalid image data`);
                throw new Error('Image data is required and must be a base64 string');
            }
            console.log(`[${MODULE_ID}] Validating filename...`);
            // Validate filename for security (prevent path traversal)
            const safeFilename = data.filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            if (!safeFilename.endsWith('.png') && !safeFilename.endsWith('.jpg') && !safeFilename.endsWith('.jpeg')) {
                throw new Error('Only PNG and JPEG images are supported');
            }
            console.log(`[${MODULE_ID}] Converting base64 to blob...`, {
                base64Length: data.imageData.length,
                estimatedSizeMB: (data.imageData.length / 1024 / 1024).toFixed(2)
            });
            // Convert base64 to Blob
            const byteCharacters = atob(data.imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            console.log(`[${MODULE_ID}] Creating file object...`, {
                filename: safeFilename,
                blobSize: blob.size
            });
            // Create a File object from the Blob
            const file = new File([blob], safeFilename, { type: 'image/png' });
            console.log(`[${MODULE_ID}] Ensuring upload directory exists...`);
            // Upload to world-specific folder so maps persist even if module is deleted
            // This also keeps maps organized per world
            const worldId = game.world?.id || 'unknown-world';
            const uploadPath = `worlds/${worldId}/ai-generated-maps`;
            try {
                // Use the modern Foundry API (v13+) with fallback for older versions
                const FilePickerAPI = globalThis.foundry?.applications?.apps?.FilePicker?.implementation || globalThis.FilePicker;
                await FilePickerAPI.createDirectory('data', uploadPath, { bucket: null });
                console.log(`[${MODULE_ID}] Directory created/verified: ${uploadPath}`);
            }
            catch (dirError) {
                // Directory might already exist, that's okay
                if (!dirError.message?.includes('EEXIST') && !dirError.message?.includes('already exists')) {
                    console.warn(`[${MODULE_ID}] Directory creation warning:`, dirError.message);
                }
            }
            console.log(`[${MODULE_ID}] Uploading to FilePicker...`);
            // Upload using Foundry's FilePicker.upload method with modern API
            const FilePickerAPI = globalThis.foundry?.applications?.apps?.FilePicker?.implementation || globalThis.FilePicker;
            const response = await FilePickerAPI.upload('data', uploadPath, file, {}, { notify: false });
            console.log(`[${MODULE_ID}] FilePicker.upload response:`, JSON.stringify(response, null, 2));
            console.log(`[${MODULE_ID}] Response keys:`, Object.keys(response || {}));
            console.log(`[${MODULE_ID}] Uploaded generated map to:`, response.path);
            return {
                success: true,
                path: response.path,
                filename: safeFilename,
                message: `Map uploaded successfully to ${response.path}`
            };
        }
        catch (error) {
            console.error(`[${MODULE_ID}] Failed to upload generated map:`, error);
            return {
                error: error.message || 'Failed to upload generated map',
                success: false
            };
        }
    }
    // ===== PHASE 7: TOKEN MANIPULATION HANDLERS =====
    /**
     * Handle move token request
     */
    async handleMoveToken(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.tokenId) {
                throw new Error('tokenId is required');
            }
            if (typeof data.x !== 'number' || typeof data.y !== 'number') {
                throw new Error('x and y coordinates are required and must be numbers');
            }
            return await this.dataAccess.moveToken(data);
        }
        catch (error) {
            throw new Error(`Failed to move token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle update token request
     */
    async handleUpdateToken(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.tokenId) {
                throw new Error('tokenId is required');
            }
            if (!data.updates || typeof data.updates !== 'object') {
                throw new Error('updates object is required');
            }
            return await this.dataAccess.updateToken(data);
        }
        catch (error) {
            throw new Error(`Failed to update token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle delete tokens request
     */
    async handleDeleteTokens(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.tokenIds || !Array.isArray(data.tokenIds) || data.tokenIds.length === 0) {
                throw new Error('tokenIds array is required and must not be empty');
            }
            return await this.dataAccess.deleteTokens(data);
        }
        catch (error) {
            throw new Error(`Failed to delete tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get token details request
     */
    async handleGetTokenDetails(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.tokenId) {
                throw new Error('tokenId is required');
            }
            return await this.dataAccess.getTokenDetails(data);
        }
        catch (error) {
            throw new Error(`Failed to get token details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle toggle token condition request
     */
    async handleToggleTokenCondition(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.tokenId) {
                throw new Error('tokenId is required');
            }
            if (!data.conditionId) {
                throw new Error('conditionId is required');
            }
            if (typeof data.active !== 'boolean') {
                throw new Error('active must be a boolean');
            }
            return await this.dataAccess.toggleTokenCondition(data);
        }
        catch (error) {
            throw new Error(`Failed to toggle token condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle get available conditions request
     */
    async handleGetAvailableConditions() {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.getAvailableConditions();
        }
        catch (error) {
            throw new Error(`Failed to get available conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle use item request (cast spell, use ability, consume item, etc.)
     */
    async handleUseItem(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.actorIdentifier) {
                throw new Error('actorIdentifier is required');
            }
            if (!data.itemIdentifier) {
                throw new Error('itemIdentifier is required');
            }
            return await this.dataAccess.useItem({
                actorIdentifier: data.actorIdentifier,
                itemIdentifier: data.itemIdentifier,
                targets: data.targets,
                options: data.options,
            });
        }
        catch (error) {
            throw new Error(`Failed to use item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle search character items request
     */
    async handleSearchCharacterItems(data) {
        try {
            // SECURITY: Silent GM validation
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data.characterIdentifier) {
                throw new Error('characterIdentifier is required');
            }
            return await this.dataAccess.searchCharacterItems({
                characterIdentifier: data.characterIdentifier,
                query: data.query,
                type: data.type,
                category: data.category,
                limit: data.limit,
            });
        }
        catch (error) {
            throw new Error(`Failed to search character items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ─── Generic actor CRUD ─────────────────────────────────────────────────────
    async handleCreateActors(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!Array.isArray(data?.actors) || data.actors.length === 0) {
                throw new Error('actors array is required and must contain at least one entry');
            }
            return await this.dataAccess.createActors(data);
        }
        catch (error) {
            throw new Error(`Failed to create actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleUpdateActors(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!Array.isArray(data?.updates) || data.updates.length === 0) {
                throw new Error('updates array is required and must contain at least one entry');
            }
            return await this.dataAccess.updateActors(data.updates);
        }
        catch (error) {
            throw new Error(`Failed to update actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleDeleteActors(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!Array.isArray(data?.ids) || data.ids.length === 0) {
                throw new Error('ids array is required and must contain at least one entry');
            }
            return await this.dataAccess.deleteActors(data.ids);
        }
        catch (error) {
            throw new Error(`Failed to delete actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleUpdateActorItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data?.actorIdentifier) {
                throw new Error('actorIdentifier is required');
            }
            if (!Array.isArray(data?.itemUpdates) || data.itemUpdates.length === 0) {
                throw new Error('itemUpdates array is required and must contain at least one entry');
            }
            return await this.dataAccess.updateActorItems(data.actorIdentifier, data.itemUpdates);
        }
        catch (error) {
            throw new Error(`Failed to update actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleDeleteActorItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data?.actorIdentifier) {
                throw new Error('actorIdentifier is required');
            }
            if (!Array.isArray(data?.itemIds) || data.itemIds.length === 0) {
                throw new Error('itemIds array is required and must contain at least one entry');
            }
            return await this.dataAccess.deleteActorItems(data.actorIdentifier, data.itemIds);
        }
        catch (error) {
            throw new Error(`Failed to delete actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleAddActorItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data?.actorIdentifier) {
                throw new Error('actorIdentifier is required');
            }
            if (!Array.isArray(data?.items) || data.items.length === 0) {
                throw new Error('items array is required and must contain at least one entry');
            }
            return await this.dataAccess.addActorItems({
                actorIdentifier: data.actorIdentifier,
                items: data.items,
            });
        }
        catch (error) {
            throw new Error(`Failed to add actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleRemoveActorItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!data?.actorIdentifier) {
                throw new Error('actorIdentifier is required');
            }
            const hasIds = Array.isArray(data?.itemIds) && data.itemIds.length > 0;
            const hasNames = Array.isArray(data?.itemNames) && data.itemNames.length > 0;
            if (!hasIds && !hasNames) {
                throw new Error('Provide itemIds and/or itemNames identifying the items to remove');
            }
            return await this.dataAccess.removeActorItems({
                actorIdentifier: data.actorIdentifier,
                ...(data.itemIds !== undefined ? { itemIds: data.itemIds } : {}),
                ...(data.itemNames !== undefined ? { itemNames: data.itemNames } : {}),
                ...(data.type !== undefined ? { type: data.type } : {}),
            });
        }
        catch (error) {
            throw new Error(`Failed to remove actor items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleCreateWorldItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!Array.isArray(data?.items) || data.items.length === 0) {
                throw new Error('items array is required and must contain at least one entry');
            }
            return await this.dataAccess.createWorldItems({
                items: data.items,
                ...(data.folder !== undefined ? { folder: data.folder } : {}),
            });
        }
        catch (error) {
            throw new Error(`Failed to create world items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleListWorldItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            return await this.dataAccess.listWorldItems({
                ...(data?.type !== undefined ? { type: data.type } : {}),
                ...(data?.folder !== undefined ? { folder: data.folder } : {}),
                ...(data?.nameFilter !== undefined ? { nameFilter: data.nameFilter } : {}),
            });
        }
        catch (error) {
            throw new Error(`Failed to list world items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleUpdateWorldItems(data) {
        try {
            const gmCheck = this.validateGMAccess();
            if (!gmCheck.allowed) {
                return { error: 'Access denied', success: false };
            }
            this.dataAccess.validateFoundryState();
            if (!Array.isArray(data?.updates) || data.updates.length === 0) {
                throw new Error('updates array is required and must contain at least one entry');
            }
            return await this.dataAccess.updateWorldItems({ updates: data.updates });
        }
        catch (error) {
            throw new Error(`Failed to update world items: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=queries.js.map