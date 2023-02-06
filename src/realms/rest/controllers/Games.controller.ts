import { Controller, GET } from "fastify-decorators"
import GamesService from "../services/Games.service"
import { AvailableGamesSchema } from "./schemas/Games.schema"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import { HasSchemaScope } from "../decorators/HasSchemaScope"
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
}
