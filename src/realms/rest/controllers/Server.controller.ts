import { Controller, GET, PATCH, PUT } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import { FastifyReply } from "fastify"
import {
  ServerInfoParamsSchema,
  ServerInfoSchema,
  ServerReadySchema,
  ServersQueryStringSchema,
  ServersSchema,
  UpdateGameServerBodySchema,
  UpdateGameServerSchema
} from "./schemas/Server.schema"
import ServerService from "../services/Server.service"
import { HasSchemaScope } from "../decorators/HasSchemaScope"

@Controller({ route: "/servers" })
export default class ServerController {
  constructor(readonly serverService: ServerService) {}

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
      req.query.hasNotTemplate,
      req.query.deployedUnder
    )
    return reply.code(200).send(fetchedServers)
  }

  @GET({
    url: "/:serverId",
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
    const fetchedServer = await this.serverService.fetchServer(
      req.params.serverId
    )
    return reply.code(200).send(fetchedServer)
  }

  @PATCH({
    url: "/:serverId/ready",
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
    const readyServer = await this.serverService.readyServer(
      req.params.serverId
    )
    return reply.code(200).send(readyServer)
  }

  @PUT({
    url: "/:serverId/gameserver",
    options: {
      schema: UpdateGameServerSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async updateGameServer(
    req: RequestWithKey<{
      Params: ServerInfoParamsSchema
      Body: UpdateGameServerBodySchema
    }>,
    reply: FastifyReply
  ) {
    const updatedServer = await this.serverService.updateGameServer(
      req.params.serverId,
      req.body
    )
    return reply.code(200).send(updatedServer)
  }
}
