import { FastifySchema } from "fastify"
import { ApiScope, GameStatus } from "@prisma/client"
import { Static, Type } from "@sinclair/typebox"
import ServerSchema from "../../schemas/Server.schema"

const ServerInfoParamsSchema = Type.Object({
  serverId: Type.String()
})

export type ServerInfoParamsSchema = Static<typeof ServerInfoParamsSchema>

export const ServerInfoSchema: FastifySchema = {
  tags: ["servers"],
  summary: "Get server info",
  operationId: "getServerInfo",
  security: [
    {
      apiKey: [ApiScope.SERVER]
    }
  ],
  params: ServerInfoParamsSchema,
  response: {
    200: Type.Ref(ServerSchema)
  }
}

const ServersQueryStringSchema = Type.Object({
  hasTemplate: Type.Optional(
    Type.Array(Type.String(), {
      description: "Filters servers that have the specified template"
    })
  ),
  hasNotTemplate: Type.Optional(
    Type.Array(Type.String(), {
      description: "Filters servers that do not have the specified template"
    })
  ),
  deployedUnder: Type.Optional(
    Type.Array(Type.String({ examples: ["proxy", "proxy.events"] }), {
      description:
        "Filters servers that are deployed under the specified template (for instance, event servers that should only be deployed under a specific event proxy)"
    })
  )
})

export type ServersQueryStringSchema = Static<typeof ServersQueryStringSchema>

export const ServersSchema: FastifySchema = {
  tags: ["servers"],
  summary: "Gets all servers",
  operationId: "getServers",
  security: [
    {
      apiKey: [ApiScope.SERVER]
    }
  ],
  querystring: ServersQueryStringSchema,
  response: {
    200: Type.Array(Type.Ref(ServerSchema))
  }
}

export const ServerReadySchema: FastifySchema = {
  tags: ["servers"],
  summary: "Marks a server as ready",
  operationId: "readyServer",
  security: [
    {
      apiKey: [ApiScope.SERVER]
    }
  ],
  params: ServerInfoParamsSchema,
  response: {
    200: Type.Ref(ServerSchema)
  }
}

const UpdateGameServerBodySchema = Type.Object({
  gameName: Type.Optional(
    Type.String({
      description: "The game to set the server to"
    })
  ),
  status: Type.String({
    description: "The status to set the server to",
    enum: Object.keys(GameStatus)
  })
})

export type UpdateGameServerBodySchema = Static<
  typeof UpdateGameServerBodySchema
>

export const UpdateGameServerSchema: FastifySchema = {
  tags: ["servers"],
  summary: "Updates a game server",
  operationId: "updateGameServer",
  security: [
    {
      apiKey: [ApiScope.SERVER, ApiScope.GAMESERVERS]
    }
  ],
  params: ServerInfoParamsSchema,
  body: UpdateGameServerBodySchema,
  response: {
    200: Type.Object({
      gameName: Type.String({
        description: "The game to set the server to"
      }),
      status: Type.String({
        description: "The status to set the server to",
        enum: Object.keys(GameStatus)
      })
    })
  }
}
