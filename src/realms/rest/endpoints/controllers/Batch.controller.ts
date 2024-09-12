import { Controller, POST } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { FastifyReply } from "fastify"
import {
  PlayerStatBatchBodySchema,
  PlayerStatManipulationMultipleSchema
} from "../schemas/Player.schema"
import PlayerService from "../services/Player.service"

@Controller({ route: "/batch" })
export default class BatchController {
  constructor(private playerService: PlayerService) {}

  @POST({
    url: "/stats",
    options: {
      schema: PlayerStatManipulationMultipleSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getAvailableGames(
    request: RequestWithKey<{ Body: PlayerStatBatchBodySchema }>,
    reply: FastifyReply
  ) {
    await this.playerService.batchUpdateStats(request.body)
    return reply.status(204).send()
  }
}
