import { Controller, DELETE, GET, PATCH, POST, PUT } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import PlayerService from "../services/Player.service"
import {
  PlayerAddPermissionGroupSchema,
  PlayerAddPermissionsSchema,
  PlayerChangeChannelBodySchema,
  PlayerChangeChannelSchema,
  PlayerChangeServerBodySchema,
  PlayerChangeServerSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema, PlayerCreateSchema,
  PlayerDisconnectSchema,
  PlayerGetPermissionsSchema,
  PlayerInfoParamsSchema,
  PlayerInfoSchema,
  PlayerPermissionGroupBodySchema,
  PlayerPermissionsBodySchema,
  PlayerRemovePermissionGroupSchema,
  PlayerRemovePermissionsBodySchema,
  PlayerRemovePermissionsSchema,
  PlayerSetPermissionGroupSchema
} from "../schemas/Player.schema"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { Permission } from "@prisma/client"
import QueueService from "../services/Queue.service"

@Controller({ route: "/players" })
export default class PlayerController {
  constructor(
    readonly playerService: PlayerService,
    readonly queueService: QueueService
  ) {}

  @POST({
    url: "",
    options: {
      schema: PlayerCreateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createPlayer(req: RequestWithKey<{ Body: PlayerConnectBodySchema}>, reply: FastifyReply) {
    this.playerService.create
  }

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
    await this.queueService.removePlayerFromGameQueue(req.params.uuid)
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
    const permissions: Partial<Permission>[] = req.body.permissions.map(
      (permission) => ({
        name: permission.name,
        expires: permission.expires
          ? new Date(permission.expires as string)
          : null,
        serverTypes: permission.serverTypes
      })
    )
    const addedPermissions = await this.playerService.addPermissions(
      req.params.uuid,
      permissions
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
      Body: PlayerRemovePermissionsBodySchema
    }>,
    reply: FastifyReply
  ) {
    const removedPermissions = await this.playerService.removePermissions(
      req.params.uuid,
      req.body.permissions
    )
    return reply.code(200).send(removedPermissions)
  }

  @POST({
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
      Body: PlayerPermissionGroupBodySchema
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
    url: "/:uuid/groups",
    options: {
      schema: PlayerSetPermissionGroupSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async setPermissionGroup(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerPermissionGroupBodySchema
    }>,
    reply: FastifyReply
  ) {
    const setPermissionGroup = await this.playerService.setPermissionGroup(
      req.params.uuid,
      req.body.groupName
    )
    return reply.code(200).send(setPermissionGroup)
  }

  @DELETE({
    url: "/:uuid/groups",
    options: {
      schema: PlayerRemovePermissionGroupSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async removePermissionGroup(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerPermissionGroupBodySchema
    }>,
    reply: FastifyReply
  ) {
    const removedPermissionGroup =
      await this.playerService.removePermissionGroup(
        req.params.uuid,
        req.body.groupName
      )
    return reply.code(200).send(removedPermissionGroup)
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
