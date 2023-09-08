import { Controller, GET, PATCH, PUT } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { FastifyReply } from "fastify"
import {
  ServerInfoParamsSchema,
  ServerInfoSchema,
  ServerReadySchema,
  ServersQueryStringSchema,
  ServersSchema,
  TransferPlayersBodySchema,
  TransferPlayersSchema,
  UpdateGameServerBodySchema,
  UpdateGameServerSchema
} from "../schemas/Server.schema"
import ServerService from "../services/Server.service"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { HasTableParams } from "../../helpers/decorators/HasTableParams"
import { emitMessage } from "../../emitter"

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
  @HasTableParams()
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
    emitMessage("serversChanged", null)
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
    emitMessage("serversChanged", null)
    return reply.code(200).send(updatedServer)
  }

  @PATCH({
    url: "/:serverId/transfer-players",
    options: {
      schema: TransferPlayersSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async transferPlayers(
    req: RequestWithKey<{
      Params: ServerInfoParamsSchema
      Body: TransferPlayersBodySchema
    }>,
    reply: FastifyReply
  ) {
    const updatedServer = await this.serverService.transferPlayers(
      req.params.serverId,
      req.body.playerUuids
    )
    return reply.code(200).send(updatedServer)
  }
}
