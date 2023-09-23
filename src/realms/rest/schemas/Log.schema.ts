import { LogLevel } from "@prisma/client"
import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    id: Type.Integer({ description: "The log ID" }),
    timestamp: Type.String({ description: "The log's timestamp" }),
    message: Type.String({ description: "The log's message" }),
    level: Type.Enum(LogLevel, { description: "The log's level" }),
    from: Type.Optional(Type.String({ description: "The log's source" })),
    data: Type.Optional(Type.Any({ description: "The log's data" })),
    serverName: Type.Optional(
      Type.String({ description: "The server's name" })
    ),
    gameServerName: Type.Optional(
      Type.String({ description: "The game server's name" })
    ),
    playerUuid: Type.Optional(
      Type.String({ description: "The player's UUID" })
    ),
    templateName: Type.Optional(
      Type.String({ description: "The template's name" })
    )
  },
  {
    $id: "Log",
    description:
      "The schema describing a log coming from either a server, a gameserver, a player or a template."
  }
)
