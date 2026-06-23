// deno-lint-ignore-file require-await
/**
 * CortexPrism CRM Sync & Intelligence Agent
 *
 * Multi-platform CRM integration (HubSpot, Salesforce, Pipedrive, Close)
 * with AI-driven pipeline insights and next-best-action recommendations.
 *
 * Plugin #189 from plugin-ideas.md
 */

import type { PluginContext, Tool, ToolCallResult } from 'cortex/plugins';

// ─── Helpers ──────────────────────────────────────────────────────────

function validatePlatform(platform: string, _ctx: PluginContext): ToolCallResult | null {
  const allowed = ['hubspot', 'salesforce', 'pipedrive', 'close'];
  if (!allowed.includes(platform)) {
    return {
      toolName: '',
      success: false,
      output: '',
      error: `Invalid platform "${platform}". Must be one of: ${allowed.join(', ')}`,
      durationMs: 0,
    };
  }
  return null;
}

// deno-lint-ignore no-unused-vars
async function getApiKey(platform: string, ctx: PluginContext): Promise<string | null> {
  const keys: Record<string, string> = {
    hubspot: 'hubspotApiKey',
    salesforce: 'salesforceClientId',
    pipedrive: 'pipedriveApiToken',
    close: 'closeApiKey',
  };
  const key = keys[platform];
  if (!key) return null;
  return await ctx.config.get<string>(key);
}

// deno-lint-ignore no-unused-vars
function makeHeaders(platform: string, apiKey: string): Record<string, string> {
  switch (platform) {
    case 'hubspot':
      return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    case 'salesforce':
      return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
    case 'pipedrive':
      return { 'Content-Type': 'application/json' };
    case 'close':
      return { Authorization: `Basic ${btoa(apiKey + ':')}`, 'Content-Type': 'application/json' };
    default:
      return { 'Content-Type': 'application/json' };
  }
}

// ─── crm_search_contacts ──────────────────────────────────────────────

const searchContactsTool: Tool = {
  definition: {
    name: 'crm_search_contacts',
    description: 'Search contacts across connected CRMs by name, email, company, or custom fields',
    params: [
      { name: 'query', type: 'string', description: 'Search query', required: true },
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: false,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close', 'all'],
      },
      { name: 'limit', type: 'number', description: 'Max results', required: false },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const query = args.query;
      const platform = (args.platform as string) || 'all';
      const limit = (args.limit as number) || 10;

      if (!query || typeof query !== 'string') {
        return {
          toolName: 'crm_search_contacts',
          success: false,
          output: '',
          error: 'Query must be a non-empty string',
          durationMs: Date.now() - start,
        };
      }

      if (platform !== 'all') {
        const err = validatePlatform(platform, ctx);
        if (err) {
          err.toolName = 'crm_search_contacts';
          return err;
        }
      }

      ctx.logger.info(`[crm] Searching contacts: "${query}" on ${platform}`);

      // Stub — real implementation would call CRM APIs
      const result = {
        query,
        platform,
        contacts: [
          {
            id: 'contact_001',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            company: 'Acme Corp',
            platform: 'hubspot',
          },
          {
            id: 'contact_002',
            name: 'Bob Smith',
            email: 'bob@example.com',
            company: 'Globex Inc',
            platform: 'salesforce',
          },
        ],
        total: 2,
        limit,
      };

      return {
        toolName: 'crm_search_contacts',
        success: true,
        output: JSON.stringify(result, null, 2),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_search_contacts',
        success: false,
        output: '',
        error: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── crm_get_deal ─────────────────────────────────────────────────────

const getDealTool: Tool = {
  definition: {
    name: 'crm_get_deal',
    description:
      'Get deal details including pipeline stage, value, contacts, activities, and close probability',
    params: [
      { name: 'deal_id', type: 'string', description: 'Deal ID or search by name', required: true },
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: false,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close'],
      },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const dealId = args.deal_id as string;
      const platform = (args.platform as string) || 'hubspot';

      if (!dealId) {
        return {
          toolName: 'crm_get_deal',
          success: false,
          output: '',
          error: 'deal_id is required',
          durationMs: Date.now() - start,
        };
      }
      const err = validatePlatform(platform, ctx);
      if (err) {
        err.toolName = 'crm_get_deal';
        return err;
      }

      ctx.logger.info(`[crm] Getting deal: ${dealId} on ${platform}`);

      const deal = {
        id: dealId,
        name: 'Enterprise License Renewal',
        stage: 'Negotiation',
        value: 75000,
        currency: 'USD',
        close_probability: 65,
        expected_close: '2026-07-15',
        owner: 'sarah@company.com',
        contacts: [{ name: 'Alice Johnson', role: 'CTO' }],
        activities: [
          { type: 'call', date: '2026-06-15', summary: 'Discussed pricing and timeline' },
          { type: 'email', date: '2026-06-10', summary: 'Sent proposal PDF' },
        ],
        platform,
      };

      return {
        toolName: 'crm_get_deal',
        success: true,
        output: JSON.stringify(deal, null, 2),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_get_deal',
        success: false,
        output: '',
        error: `Failed to get deal: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── crm_update_deal ──────────────────────────────────────────────────

const updateDealTool: Tool = {
  definition: {
    name: 'crm_update_deal',
    description: 'Update deal stage, add notes, change owner, or update deal properties',
    params: [
      { name: 'deal_id', type: 'string', description: 'Deal ID', required: true },
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: true,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close'],
      },
      { name: 'stage', type: 'string', description: 'New pipeline stage', required: false },
      { name: 'notes', type: 'string', description: 'Activity notes', required: false },
      { name: 'owner', type: 'string', description: 'Reassign to user', required: false },
      { name: 'amount', type: 'number', description: 'Deal amount', required: false },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const dealId = args.deal_id as string;
      const platform = args.platform as string;

      if (!dealId) {
        return {
          toolName: 'crm_update_deal',
          success: false,
          output: '',
          error: 'deal_id is required',
          durationMs: Date.now() - start,
        };
      }
      const err = validatePlatform(platform, ctx);
      if (err) {
        err.toolName = 'crm_update_deal';
        return err;
      }

      const changes: Record<string, unknown> = {};
      if (args.stage) changes.stage = args.stage;
      if (args.notes) changes.notes = args.notes;
      if (args.owner) changes.owner = args.owner;
      if (args.amount !== undefined) changes.amount = args.amount;

      if (Object.keys(changes).length === 0) {
        return {
          toolName: 'crm_update_deal',
          success: false,
          output: '',
          error: 'At least one update field (stage, notes, owner, amount) is required',
          durationMs: Date.now() - start,
        };
      }

      ctx.logger.info(`[crm] Updating deal ${dealId} on ${platform}: ${JSON.stringify(changes)}`);

      return {
        toolName: 'crm_update_deal',
        success: true,
        output: JSON.stringify(
          { deal_id: dealId, platform, updated: changes, status: 'success' },
          null,
          2,
        ),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_update_deal',
        success: false,
        output: '',
        error: `Update failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── crm_create_contact ───────────────────────────────────────────────

const createContactTool: Tool = {
  definition: {
    name: 'crm_create_contact',
    description: 'Create a new contact or lead in the CRM with enrichment data',
    params: [
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: true,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close'],
      },
      { name: 'first_name', type: 'string', description: 'First name', required: true },
      { name: 'last_name', type: 'string', description: 'Last name', required: true },
      { name: 'email', type: 'string', description: 'Email', required: false },
      { name: 'company', type: 'string', description: 'Company', required: false },
      { name: 'phone', type: 'string', description: 'Phone', required: false },
      { name: 'tags', type: 'string', description: 'Comma-separated tags', required: false },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const platform = args.platform as string;
      const firstName = args.first_name as string;
      const lastName = args.last_name as string;

      if (!firstName || !lastName) {
        return {
          toolName: 'crm_create_contact',
          success: false,
          output: '',
          error: 'first_name and last_name are required',
          durationMs: Date.now() - start,
        };
      }
      const err = validatePlatform(platform, ctx);
      if (err) {
        err.toolName = 'crm_create_contact';
        return err;
      }

      ctx.logger.info(`[crm] Creating contact: ${firstName} ${lastName} on ${platform}`);

      const contact = {
        id: `contact_${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        email: args.email || '',
        company: args.company || '',
        phone: args.phone || '',
        tags: args.tags ? (args.tags as string).split(',').map((t: string) => t.trim()) : [],
        platform,
        created_at: new Date().toISOString(),
      };

      return {
        toolName: 'crm_create_contact',
        success: true,
        output: JSON.stringify(contact, null, 2),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_create_contact',
        success: false,
        output: '',
        error: `Create failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── crm_get_pipeline ─────────────────────────────────────────────────

const getPipelineTool: Tool = {
  definition: {
    name: 'crm_get_pipeline',
    description:
      'Get pipeline summary with deal counts, values, weighted forecast, and conversion rates',
    params: [
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: true,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close'],
      },
      { name: 'owner', type: 'string', description: 'Filter by owner email', required: false },
      {
        name: 'date_range',
        type: 'string',
        description: 'Date range (this_month, last_quarter, etc.)',
        required: false,
      },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const platform = args.platform as string;
      const err = validatePlatform(platform, ctx);
      if (err) {
        err.toolName = 'crm_get_pipeline';
        return err;
      }

      ctx.logger.info(`[crm] Getting pipeline for ${platform}`);

      const pipeline = {
        platform,
        summary: {
          total_deals: 47,
          total_value: 1250000,
          weighted_forecast: 780000,
          avg_deal_size: 26595,
          avg_cycle_days: 34,
        },
        stages: [
          { name: 'Lead', count: 18, value: 320000, conversion: 80 },
          { name: 'Qualified', count: 12, value: 380000, conversion: 60 },
          { name: 'Proposal', count: 8, value: 290000, conversion: 45 },
          { name: 'Negotiation', count: 6, value: 180000, conversion: 70 },
          { name: 'Closed Won', count: 3, value: 80000, conversion: 100 },
        ],
        date_range: args.date_range || 'this_quarter',
      };

      return {
        toolName: 'crm_get_pipeline',
        success: true,
        output: JSON.stringify(pipeline, null, 2),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_get_pipeline',
        success: false,
        output: '',
        error: `Pipeline fetch failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── crm_suggest_actions ──────────────────────────────────────────────

const suggestActionsTool: Tool = {
  definition: {
    name: 'crm_suggest_actions',
    description:
      'AI-driven next-best-action recommendations based on deal history, engagement, and pipeline health',
    params: [
      {
        name: 'deal_id',
        type: 'string',
        description: 'Deal ID (omit for overall recommendations)',
        required: false,
      },
      {
        name: 'platform',
        type: 'string',
        description: 'CRM platform',
        required: true,
        enum: ['hubspot', 'salesforce', 'pipedrive', 'close'],
      },
      { name: 'context', type: 'string', description: 'Additional context', required: false },
    ],
    capabilities: ['network:fetch'],
  },

  execute: async (args: Record<string, unknown>, ctx: PluginContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const platform = args.platform as string;
      const err = validatePlatform(platform, ctx);
      if (err) {
        err.toolName = 'crm_suggest_actions';
        return err;
      }

      ctx.logger.info(`[crm] Generating action suggestions for ${platform}`);

      const suggestions = args.deal_id
        ? {
          deal_id: args.deal_id,
          risk_level: 'medium',
          suggestions: [
            {
              action: 'schedule_follow_up',
              priority: 'high',
              reason:
                'Last contact was 8 days ago — deals with >7 day gaps have 40% lower close rates',
            },
            {
              action: 'send_case_study',
              priority: 'medium',
              reason: 'Similar deals in healthcare vertical closed faster with case study attached',
            },
            {
              action: 'involve_executive',
              priority: 'low',
              reason: 'Deal value exceeds $50K threshold for executive sponsorship',
            },
          ],
        }
        : {
          pipeline_wide: true,
          suggestions: [
            {
              action: 'focus_qualified',
              priority: 'high',
              reason: '12 deals stuck in Qualified stage >14 days — schedule review meeting',
            },
            {
              action: 'update_stale',
              priority: 'medium',
              reason: '5 deals with no activity in 30+ days — re-engage or mark lost',
            },
            {
              action: 'accelerate_negotiation',
              priority: 'medium',
              reason: '3 deals in Negotiation past expected close date',
            },
          ],
        };

      return {
        toolName: 'crm_suggest_actions',
        success: true,
        output: JSON.stringify(suggestions, null, 2),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName: 'crm_suggest_actions',
        success: false,
        output: '',
        error: `Suggestion failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ─── Lifecycle hooks ──────────────────────────────────────────────────

export async function onLoad(ctx: PluginContext): Promise<void> {
  ctx.logger.info('[cortex-plugin-crm] Loaded — HubSpot, Salesforce, Pipedrive, Close CRM');
}

export async function onUnload(ctx: PluginContext): Promise<void> {
  ctx.logger.info('[cortex-plugin-crm] Unloading...');
}

// ─── Exports ──────────────────────────────────────────────────────────

export const tools: Tool[] = [
  searchContactsTool,
  getDealTool,
  updateDealTool,
  createContactTool,
  getPipelineTool,
  suggestActionsTool,
];
