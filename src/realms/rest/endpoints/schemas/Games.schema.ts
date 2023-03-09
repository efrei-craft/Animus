import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import GameSchema from "../../schemas/Game.schema"

export const AvailableGamesSchema: FastifySchema = {
  tags: ["games"],
  summary: "Get all available games",
  operationId: "getAvailableGames",
  security: [
    {
      apiKey: [ApiScope.GAMES, ApiScope.SERVER]
    }
  ],
  response: {
    200: Type.Array(Type.Ref(GameSchema))
  }
}
