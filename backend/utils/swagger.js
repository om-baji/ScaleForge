export const config = {
  "openapi": "3.0.0",
  "info": {
    "title": "Event API",
    "version": "1.0.0",
    "description": "API for managing events"
  },
  "paths": {
    "/event/bulk": {
      "get": {
        "summary": "Get all events",
        "tags": ["Event"],
        "responses": {
          "200": {
            "description": "List of all events",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetAllResponse"
                }
              }
            }
          }
        }
      }
    },
    "/event/{id}": {
      "get": {
        "summary": "Get event by ID",
        "tags": ["Event"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Single event found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GetByIdResponse"
                }
              }
            }
          },
          "404": {
            "description": "Event not found"
          }
        }
      },
      "put": {
        "summary": "Update event",
        "tags": ["Event"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateEventRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Event updated",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/CreateOrUpdateResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "summary": "Delete event by ID",
        "tags": ["Event"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Event deleted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "message": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/event/create": {
      "post": {
        "summary": "Create event",
        "tags": ["Event"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateEventRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Event created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/CreateOrUpdateResponse" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreateEventRequest": {
        "type": "object",
        "required": ["name", "max", "date"],
        "properties": {
          "name": { "type": "string" },
          "max": { "type": "integer" },
          "date": { "type": "string", "format": "date-time" }
        }
      },
      "UpdateEventRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "max": { "type": "integer" },
          "date": { "type": "string", "format": "date-time" },
          "description": { "type": "string" },
          "location": { "type": "string" },
          "isActive": { "type": "boolean" }
        }
      },
      "Event": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "location": { "type": "string" },
          "max": { "type": "integer" },
          "date": { "type": "string", "format": "date-time" },
          "isActive": { "type": "boolean" },
          "createdAt": { "type": "string", "format": "date-time" },
          "updatedAt": { "type": "string", "format": "date-time" },
          "organizerId": { "type": "string" }
        }
      },
      "GetAllResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "events": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/Event" }
          }
        }
      },
      "GetByIdResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "event": { "$ref": "#/components/schemas/Event" }
        }
      },
      "CreateOrUpdateResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "event": { "$ref": "#/components/schemas/Event" }
        }
      }
    }
  },
  "tags": [
    {
      "name": "Event",
      "description": "Operations related to events"
    }
  ]
}
