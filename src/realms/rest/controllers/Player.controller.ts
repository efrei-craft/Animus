import { Controller, DELETE, GET, PATCH, POST, PUT } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import PlayerService from "../services/Player.service"
import {
  PlayerAddPermissionGroupBodySchema,
  PlayerAddPermissionGroupSchema,
  PlayerAddPermissionsSchema,
  PlayerChangeChannelBodySchema,
  PlayerChangeChannelSchema,
  PlayerChangeServerBodySchema,
  PlayerChangeServerSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema,
  PlayerDisconnectSchema,
  PlayerGetPermissionsSchema,
  PlayerInfoParamsSchema,
  PlayerInfoSchema,
  PlayerPermissionsBodySchema,
  PlayerRemovePermissionsSchema
} from "./schemas/Player.schema"
import { HasSchemaScope } from "../decorators/HasSchemaScope"

@Controller({ route: "/players" })
export default class PlayerController {
  constructor(readonly playerService: PlayerService) {}

  @GET({
    url: "/:uuid",
    options: {
      schema: PlayerInfoSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getPlayerInfo(
    req: RequestWithKey<{ Params: PlayerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedPlayer = await this.playerService.fetchPlayer(
      req.params.uuid,
      false
    )
    return reply.code(200).send(fetchedPlayer)
  }

  @POST({
    url: "/:uuid/connect",
    options: {
      schema: PlayerConnectSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async connect(
    req: RequestWithKey<{
      Body: PlayerConnectBodySchema
      Params: PlayerInfoParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const fetchedPlayer = await this.playerService.fetchPlayer(
      req.params.uuid,
      true,
      req.body.username
    )
    return reply.code(200).send(fetchedPlayer)
  }

  @POST({
    url: "/:uuid/disconnect",
    options: {
      schema: PlayerDisconnectSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async disconnect(
    req: RequestWithKey<{ Params: PlayerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedPlayer = await this.playerService.disconnectPlayer(
      req.params.uuid
    )
    return reply.code(200).send(fetchedPlayer)
  }

  @PATCH({
    url: "/:uuid/server",
    options: {
      schema: PlayerChangeServerSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async changeServer(
    req: RequestWithKey<{
      Body: PlayerChangeServerBodySchema
      Params: PlayerInfoParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const serverPlayer = await this.playerService.changeServer(
      req.params.uuid,
      req.body.serverName
    )
    return reply.code(200).send(serverPlayer)
  }

  @GET({
    url: "/:uuid/permissions",
    options: {
      schema: PlayerGetPermissionsSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getPermissions(
    req: RequestWithKey<{ Params: PlayerInfoParamsSchema }>,
    reply: FastifyReply
  ) {
    const permissions = await this.playerService.getPermissions(req.params.uuid)
    return reply.code(200).send(permissions)
  }

  @PUT({
    url: "/:uuid/permissions",
    options: {
      schema: PlayerAddPermissionsSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async addPermissions(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerPermissionsBodySchema
    }>,
    reply: FastifyReply
  ) {
    const addedPermissions = await this.playerService.addPermissions(
      req.params.uuid,
      req.body.permissions
    )
    return reply.code(200).send(addedPermissions)
  }

  @DELETE({
    url: "/:uuid/permissions",
    options: {
      schema: PlayerRemovePermissionsSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async removePermissions(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerPermissionsBodySchema
    }>,
    reply: FastifyReply
  ) {
    const removedPermissions = await this.playerService.removePermissions(
      req.params.uuid,
      req.body.permissions
    )
    return reply.code(200).send(removedPermissions)
  }

  @PUT({
    url: "/:uuid/groups",
    options: {
      schema: PlayerAddPermissionGroupSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async addPermissionGroup(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerAddPermissionGroupBodySchema
    }>,
    reply: FastifyReply
  ) {
    const addedPermissionGroup = await this.playerService.addPermissionGroup(
      req.params.uuid,
      req.body.groupName
    )
    return reply.code(200).send(addedPermissionGroup)
  }

  @PATCH({
    url: "/:uuid/channel",
    options: {
      schema: PlayerChangeChannelSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async changeChannel(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerChangeChannelBodySchema
    }>,
    reply: FastifyReply
  ) {
    const changedChannel = await this.playerService.changeChannel(
      req.params.uuid,
      req.body.channel
    )
    return reply.code(200).send(changedChannel)
  }
}
