# Schema

```json
{
  "workspace": "agent",
  "provider": "openai",
  "chatModel": "gpt-5.5",
  "imageModel": "gpt-image-2",
  "features": [
    "upload",
    "workflow",
    "history",
    "plugins"
  ]
}
```

## JSON Schema Export

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://company.local/schemas/workspace.schema.json",
  "title": "WorkspaceSchema",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "workspace",
    "provider",
    "chatModel",
    "imageModel",
    "features",
    "theme",
    "providerConfig"
  ],
  "properties": {
    "workspace": {
      "type": "string",
      "enum": [
        "chat",
        "image",
        "agent"
      ]
    },
    "provider": {
      "type": "string",
      "minLength": 1
    },
    "chatModel": {
      "type": "string",
      "minLength": 1
    },
    "imageModel": {
      "type": "string",
      "minLength": 1
    },
    "features": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [
          "upload",
          "workflow",
          "history",
          "streaming",
          "plugins"
        ]
      }
    },
    "theme": {
      "$ref": "#/definitions/ThemeSchema"
    },
    "providerConfig": {
      "$ref": "#/definitions/ProviderSchema"
    }
  },
  "definitions": {
    "ThemeSchema": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://company.local/schemas/theme.schema.json",
      "title": "ThemeSchema",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "mode",
        "tokens"
      ],
      "properties": {
        "mode": {
          "type": "string",
          "enum": [
            "light",
            "dark",
            "auto"
          ]
        },
        "tokens": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    },
    "ProviderSchema": {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://company.local/schemas/provider.schema.json",
      "title": "ProviderSchema",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "provider",
        "apiKey",
        "baseUrl",
        "chatModel",
        "imageModel",
        "timeout",
        "maxRetries"
      ],
      "properties": {
        "provider": {
          "type": "string",
          "minLength": 1
        },
        "apiKey": {
          "type": "string"
        },
        "baseUrl": {
          "type": "string",
          "minLength": 1
        },
        "chatModel": {
          "type": "string",
          "minLength": 1
        },
        "imageModel": {
          "type": "string",
          "minLength": 1
        },
        "timeout": {
          "type": "number",
          "minimum": 1
        },
        "maxRetries": {
          "type": "number",
          "minimum": 0
        }
      }
    }
  }
}
```
