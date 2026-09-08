import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export interface SceneManagementToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

/** Generic scene creation, configuration, deletion, and restore for Foundry map fields. */
export class SceneManagementTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor({ foundryClient, logger }: SceneManagementToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'SceneManagementTools' });
    this.errorHandler = new ErrorHandler(this.logger);
  }

  getToolDefinitions() {
    return [
      {
        name: 'manage-scenes',
        description:
          'Create, update, delete, or restore scenes with common map fields. Use "create" for new scenes, ' +
          'and use a Foundry ID or exact scene name to update, delete, or restore scenes.',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'restore'],
              description: 'Operation to perform: "create", "update", "delete", or "restore".',
            },
            scenes: {
              type: 'array',
              description: 'Scenes to create (action: "create")',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  width: { type: 'number', description: 'Scene width in pixels' },
                  height: { type: 'number', description: 'Scene height in pixels' },
                  padding: { type: 'number', description: 'Scene padding multiplier' },
                  background: { type: 'string', description: 'Background image or video path' },
                  backgroundColor: { type: 'string', description: 'Background color' },
                  grid: { type: 'object', description: 'Foundry grid configuration object' },
                  gridSize: { type: 'number', description: 'Grid size in pixels' },
                  gridDistance: { type: 'number', description: 'Grid distance in scene units' },
                  gridUnits: { type: 'string', description: 'Grid distance unit label' },
                  navigation: { type: 'boolean', description: 'Show scene in navigation' },
                  navName: { type: 'string', description: 'Navigation label' },
                },
                required: ['name'],
              },
            },
            folder: {
              type: 'string',
              description: 'Folder name for newly created scenes (default "Foundry MCP Scenes")',
            },
            updates: {
              type: 'array',
              description: 'Scene patches to apply (action: "update")',
              items: {
                type: 'object',
                properties: {
                  identifier: { type: 'string', description: 'Foundry scene ID or exact scene name' },
                  name: { type: 'string' },
                  width: { type: 'number', description: 'Scene width in pixels' },
                  height: { type: 'number', description: 'Scene height in pixels' },
                  padding: { type: 'number', description: 'Scene padding multiplier' },
                  background: { type: 'string', description: 'Background image or video path' },
                  backgroundColor: { type: 'string', description: 'Background color' },
                  grid: { type: 'object', description: 'Foundry grid configuration object' },
                  gridSize: { type: 'number', description: 'Grid size in pixels' },
                  gridDistance: { type: 'number', description: 'Grid distance in scene units' },
                  gridUnits: { type: 'string', description: 'Grid distance unit label' },
                  navigation: { type: 'boolean', description: 'Show scene in navigation' },
                  navName: { type: 'string', description: 'Navigation label' },
                  folder: { type: 'string', description: 'Folder name to place the scene in' },
                },
                required: ['identifier'],
              },
            },
            identifiers: {
              type: 'array',
              description: 'Foundry scene IDs or exact scene names to delete or restore (actions: "delete" or "restore")',
              items: { type: 'string' },
            },
          },
          required: ['action'],
        },
      },
    ];
  }

  async handleManageScenes(args: any): Promise<any> {
    const { action } = z.object({ action: z.enum(['create', 'update', 'delete', 'restore']) }).parse(args);

    switch (action) {
      case 'create':
        return this.handleCreate(args);
      case 'update':
        return this.handleUpdate(args);
      case 'delete':
        return this.handleDelete(args);
      case 'restore':
        return this.handleRestore(args);
    }
  }

  private async handleCreate(args: any): Promise<any> {
    const sceneSchema = z.object({
      name: z.string().min(1),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      padding: z.number().min(0).optional(),
      background: z.string().min(1).optional(),
      backgroundColor: z.string().min(1).optional(),
      grid: z.record(z.any()).optional(),
      gridSize: z.number().positive().optional(),
      gridDistance: z.number().positive().optional(),
      gridUnits: z.string().optional(),
      navigation: z.boolean().optional(),
      navName: z.string().optional(),
    });
    const { scenes, folder } = z
      .object({ scenes: z.array(sceneSchema).min(1), folder: z.string().optional() })
      .parse(args);

    this.logger.info('Creating scenes', { count: scenes.length });
    try {
      return await this.foundryClient.query('foundry-mcp-bridge.createScenes', { scenes, folder });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-scenes (create)', 'scene creation');
    }
  }

  private async handleUpdate(args: any): Promise<any> {
    const updateSchema = z.object({
      identifier: z.string().min(1),
      name: z.string().min(1).optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      padding: z.number().min(0).optional(),
      background: z.string().min(1).optional(),
      backgroundColor: z.string().min(1).optional(),
      grid: z.record(z.any()).optional(),
      gridSize: z.number().positive().optional(),
      gridDistance: z.number().positive().optional(),
      gridUnits: z.string().optional(),
      navigation: z.boolean().optional(),
      navName: z.string().optional(),
      folder: z.string().min(1).optional(),
    });
    const { updates } = z.object({ updates: z.array(updateSchema).min(1) }).parse(args);

    this.logger.info('Updating scenes', { count: updates.length });
    try {
      return await this.foundryClient.query('foundry-mcp-bridge.updateScenes', { updates });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-scenes (update)', 'scene update');
    }
  }

  private async handleDelete(args: any): Promise<any> {
    const { identifiers } = z.object({ identifiers: z.array(z.string().min(1)).min(1) }).parse(args);

    this.logger.info('Deleting scenes', { count: identifiers.length });
    try {
      return await this.foundryClient.query('foundry-mcp-bridge.deleteScenes', { identifiers });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-scenes (delete)', 'scene deletion');
    }
  }

  private async handleRestore(args: any): Promise<any> {
    const { identifiers } = z.object({ identifiers: z.array(z.string().min(1)).min(1) }).parse(args);

    this.logger.info('Restoring scenes', { count: identifiers.length });
    try {
      return await this.foundryClient.query('foundry-mcp-bridge.restoreScenes', { identifiers });
    } catch (error) {
      this.errorHandler.handleToolError(error, 'manage-scenes (restore)', 'scene restore');
    }
  }
}
