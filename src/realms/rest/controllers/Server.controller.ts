import { Controller, GET } from "fastify-decorators"
import { RequestWithKey } from "../decorators/HasApiKey"
import { FastifyReply } from "fastify"
import {
  ServerInfoParamsSchema,
  ServerInfoSchema
} from "./schemas/Server.schema"
import ServerService from "../services/Server.service"

@Controller({ route: "/servers" })
export default class ServerController {
  constructor(readonly serverService: ServerService) {}

  @GET({
    url: "/:id",
    options: {
      schema: ServerInfoSchema
    }
  })
  async getServerInfo(
    req: RequestWithKey<{ Params: ServerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedServer = await this.serverService.fetchServer(
      req.params.id,
      false
    )
    return reply.code(200).send(fetchedServer)
  }
}
