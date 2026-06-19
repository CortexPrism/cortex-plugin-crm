# CRM Sync & Intelligence Agent

Multi-platform CRM plugin for CortexPrism — HubSpot, Salesforce, Pipedrive, and Close CRM integration with AI-driven next-best-action recommendations.

## Installation

```bash
cortex plugin install github:CortexPrism/cortex-plugin-crm
```

## Tools

| Tool | Description |
|------|-------------|
| `crm_search_contacts` | Search contacts by name, email, company across CRMs |
| `crm_get_deal` | Get deal details including pipeline stage, value, contacts |
| `crm_update_deal` | Update deal stage, add notes, reassign owner |
| `crm_create_contact` | Create a new contact or lead |
| `crm_get_pipeline` | Get pipeline summary with deal counts, values, forecast |
| `crm_suggest_actions` | AI-driven next-best-action recommendations |

## Configuration

Configure in `~/.cortex/config.json`:

```json
{
  "plugins": {
    "cortex-plugin-crm": {
      "hubspotApiKey": "your-hubspot-key",
      "pipedriveApiToken": "your-pipedrive-token",
      "closeApiKey": "your-close-key"
    }
  }
}
```

For Salesforce, set `salesforceClientId`, `salesforceClientSecret`, and `salesforceInstanceUrl`.

## Supported Platforms

- **HubSpot** — API key authentication
- **Salesforce** — OAuth2 client credentials
- **Pipedrive** — API token authentication
- **Close CRM** — API key (Basic auth)

## Development

```bash
deno task test
deno fmt
deno lint
```

## License

MIT
