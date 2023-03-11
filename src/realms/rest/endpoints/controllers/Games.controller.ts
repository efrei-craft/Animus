import { Controller, GET } from "fastify-decorators"
import GamesService from "../services/Games.service"
import {
  AvailableGamesSchema,
  GetPlayerCountSchema
} from "../schemas/Games.schema"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { FastifyReply } from "fastify"

@Controller({ route: "/games" })
export default class GamesController {
  constructor(private gamesService: GamesService) {}

  @GET({
    url: "/available-games",
    options: {
      schema: AvailableGamesSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getAvailableGames(request: RequestWithKey, reply: FastifyReply) {
    const availableGames = await this.gamesService.getAvailableGames()
    return reply.code(200).send(availableGames)
  }

  @GET({
    url: "/player-count",
    options: {
      schema: GetPlayerCountSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getPlayerCount(request: RequestWithKey, reply: FastifyReply) {
    const playerCount = await this.gamesService.getGamePlayerCounts()
    return reply.code(200).send(playerCount)
  }
}
