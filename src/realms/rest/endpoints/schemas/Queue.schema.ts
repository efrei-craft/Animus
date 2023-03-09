import { ApiScope } from "@prisma/client"
import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"

export const GameQueueParamsSchema = Type.Object({
  gameName: Type.String()
})

export type GameQueueParamsSchema = Static<typeof GameQueueParamsSchema>

// Add Player to Game Queue

export const AddPlayerToGameQueueBodySchema = Type.Object({
  playerUuid: Type.String()
})

export type AddPlayerToGameQueueBodySchema = Static<
  typeof AddPlayerToGameQueueBodySchema
>

export const AddPlayerToGameQueueSchema: FastifySchema = {
  tags: ["queues"],
  summary: "Add a player to a game queue",
  operationId: "addPlayerToGameQueue",
  security: [
    {
      apiKey: [ApiScope.QUEUES]
    }
  ],
  body: AddPlayerToGameQueueBodySchema,
  params: GameQueueParamsSchema,
  response: {
    200: Type.Object({})
  }
}

// Remove Player from Game Queue

export const RemovePlayerFromGameQueueParamsSchema = Type.Object({
  playerUuid: Type.String()
})

export type RemovePlayerFromGameQueueParamsSchema = Static<
  typeof RemovePlayerFromGameQueueParamsSchema
>

export const RemovePlayerFromGameQueueSchema: FastifySchema = {
  tags: ["queues"],
  summary: "Remove a player from their current game queue",
  operationId: "removePlayerFromGameQueue",
  security: [
    {
      apiKey: [ApiScope.QUEUES]
    }
  ],
  params: RemovePlayerFromGameQueueParamsSchema,
  response: {
    200: Type.Object({})
  }
}
