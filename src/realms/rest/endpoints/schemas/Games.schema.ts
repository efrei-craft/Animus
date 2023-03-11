import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import GameSchema from "../../schemas/Game.schema"
import PlayerCountSchema from "../../schemas/PlayerCount.schema"

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

export const GetPlayerCountSchema: FastifySchema = {
  tags: ["games"],
  summary: "Get the player count of all games",
  operationId: "getPlayerCount",
  security: [
    {
      apiKey: [ApiScope.GAMES, ApiScope.SERVER]
    }
  ],
  response: {
    200: Type.Array(Type.Ref(PlayerCountSchema))
  }
}
