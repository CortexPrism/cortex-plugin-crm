// deno-lint-ignore-file require-await, no-unused-vars
import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { tools } from '../../mod.ts';
import type { PluginContext } from 'cortex/plugins';

const ctx: PluginContext = {
  pluginId: 'cortex-plugin-crm',
  pluginDir: '/tmp/crm',
  state: { get: async () => null, set: async () => {} },
  config: {},
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
};

const find = (n: string) => tools.find((t) => t.definition.name === n)!;

Deno.test('crm_search_contacts — returns results', async () => {
  const r = await find('crm_search_contacts').execute({ query: 'Alice', platform: 'hubspot' }, ctx);
  assertEquals(r.success, true);
  assertStringIncludes(r.output, 'Alice');
});

Deno.test('crm_search_contacts — rejects empty query', async () => {
  const r = await find('crm_search_contacts').execute({ query: '' }, ctx);
  assertEquals(r.success, false);
});

Deno.test('crm_search_contacts — rejects invalid platform', async () => {
  const r = await find('crm_search_contacts').execute({ query: 'test', platform: 'invalid' }, ctx);
  assertEquals(r.success, false);
});

Deno.test('crm_get_deal — returns deal details', async () => {
  const r = await find('crm_get_deal').execute({ deal_id: 'deal_123', platform: 'hubspot' }, ctx);
  assertEquals(r.success, true);
  assertStringIncludes(r.output, 'Enterprise');
});

Deno.test('crm_update_deal — updates deal fields', async () => {
  const r = await find('crm_update_deal').execute({
    deal_id: 'd1',
    platform: 'hubspot',
    stage: 'Closed Won',
  }, ctx);
  assertEquals(r.success, true);
});

Deno.test('crm_update_deal — rejects no update fields', async () => {
  const r = await find('crm_update_deal').execute({ deal_id: 'd1', platform: 'hubspot' }, ctx);
  assertEquals(r.success, false);
});

Deno.test('crm_create_contact — creates contact', async () => {
  const r = await find('crm_create_contact').execute({
    platform: 'hubspot',
    first_name: 'Test',
    last_name: 'User',
  }, ctx);
  assertEquals(r.success, true);
  assertStringIncludes(r.output, 'Test');
});

Deno.test('crm_get_pipeline — returns pipeline stats', async () => {
  const r = await find('crm_get_pipeline').execute({ platform: 'hubspot' }, ctx);
  assertEquals(r.success, true);
  assertStringIncludes(r.output, 'stages');
});

Deno.test('crm_suggest_actions — returns recommendations', async () => {
  const r = await find('crm_suggest_actions').execute({ platform: 'hubspot', deal_id: 'd1' }, ctx);
  assertEquals(r.success, true);
  assertStringIncludes(r.output, 'suggestions');
});

Deno.test('tools array — has 6 tools', () => {
  assertEquals(tools.length, 6);
});
