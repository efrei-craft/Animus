import { Controller, DELETE, PUT } from "fastify-decorators"
import QueueService from "../services/Queue.service"
import {
  AddPlayerToGameQueueBodySchema,
  AddPlayerToGameQueueSchema,
  GameQueueParamsSchema,
  RemovePlayerFromGameQueueParamsSchema,
  RemovePlayerFromGameQueueSchema
} from "../schemas/Queue.schema"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { FastifyReply } from "fastify"

@Controller({ route: "/queues" })
export default class QueueController {
  constructor(readonly queueService: QueueService) {}

  @PUT({
    url: "/:gameName",
    options: {
      schema: AddPlayerToGameQueueSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async addPlayerToGameQueue(
    req: RequestWithKey<{
      Params: GameQueueParamsSchema
      Body: AddPlayerToGameQueueBodySchema
    }>,
    reply: FastifyReply
  ) {
    const addedPlayer = await this.queueService.addPlayerToGameQueue(
      req.params.gameName,
      req.body.playerUuid
    )
    return reply.code(200).send(addedPlayer)
  }

  @DELETE({
    url: "/:playerUuid",
    options: {
      schema: RemovePlayerFromGameQueueSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async removePlayerFromGameQueue(
    req: RequestWithKey<{
      Params: RemovePlayerFromGameQueueParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const removedPlayer = await this.queueService.removePlayerFromGameQueue(
      req.params.playerUuid
    )
    return reply.code(200).send(removedPlayer)
  }
}
