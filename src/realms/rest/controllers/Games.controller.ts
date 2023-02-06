import { Controller, GET } from "fastify-decorators"
import GamesService from "../services/Games.service"
import { AvailableGamesSchema } from "./schemas/Games.schema"

@Controller({ route: "/games" })
export default class GamesController {
  constructor(private gamesService: GamesService) {}

  @GET({
    url: "/available-games",
    options: {
      schema: AvailableGamesSchema
    }
  })
  @HasApi
  async getAvailableGames() {}
}
