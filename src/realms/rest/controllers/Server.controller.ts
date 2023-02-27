import { Controller, GET, PATCH } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import { FastifyReply } from "fastify"
import {
  ServerInfoParamsSchema,
  ServerInfoSchema,
  ServerReadySchema,
  ServersQueryStringSchema,
  ServersSchema
} from "./schemas/Server.schema"
import ServerService from "../services/Server.service"
import { HasSchemaScope } from "../decorators/HasSchemaScope"

@Controller({ route: "/servers" })
export default class ServerController {
  constructor(readonly serverService: ServerService) {}

  @GET({
    url: "/:id",
    options: {
      schema: ServerInfoSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getServerInfo(
    req: RequestWithKey<{ Params: ServerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedServer = await this.serverService.fetchServer(req.params.id)
    return reply.code(200).send(fetchedServer)
  }

  @GET({
    url: "",
    options: {
      schema: ServersSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getServers(
    req: RequestWithKey<{ Querystring: ServersQueryStringSchema }>,
    reply: FastifyReply
  ) {
    const fetchedServers = await this.serverService.fetchServers(
      req.query.hasTemplate,
      req.query.hasNotTemplate
    )
    return reply.code(200).send(fetchedServers)
  }

  @PATCH({
    url: "/:id/ready",
    options: {
      schema: ServerReadySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async readyServer(
    req: RequestWithKey<{ Params: ServerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const readyServer = await this.serverService.readyServer(req.params.id)
    return reply.code(200).send(readyServer)
  }
}
