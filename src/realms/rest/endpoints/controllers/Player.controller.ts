import { Controller, DELETE, GET, PATCH, POST, PUT } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import PlayerService from "../services/Player.service"
import {
  GetAllPlayersSchema,
  PlayerAddPermissionGroupSchema,
  PlayerAddPermissionsSchema,
  PlayerChangeChannelBodySchema,
  PlayerChangeChannelSchema,
  PlayerChangeServerBodySchema,
  PlayerChangeServerSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema,
  PlayerCreateBodySchema,
  PlayerCreateSchema,
  PlayerDisconnectSchema,
  PlayerGetOnlineSchema,
  PlayerGetPermissionsSchema,
  PlayerInfoParamsSchema,
  PlayerInfoSchema,
  PlayerMigrateBodySchema,
  PlayerMigrateSchema,
  PlayerPermissionGroupBodySchema,
  PlayerPermissionGroupsBodySchema,
  PlayerPermissionsBodySchema,
  PlayerRemovePermissionGroupSchema,
  PlayerRemovePermissionsBodySchema,
  PlayerRemovePermissionsSchema,
  PlayerSetPermissionGroupsSchema
} from "../schemas/Player.schema"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { Permission } from "@prisma/client"
import QueueService from "../services/Queue.service"
import PartyService from "../services/Party.service"
import { emitter } from "../../emitter"

@Controller({ route: "/players" })
export default class PlayerController {
  constructor(
    readonly playerService: PlayerService,
    readonly queueService: QueueService,
    readonly partyService: PartyService
  ) {}

  @POST({
    url: "",
    options: {
      schema: PlayerCreateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createPlayer(
    req: RequestWithKey<{ Body: PlayerCreateBodySchema }>,
    reply: FastifyReply
  ) {
    const createdPlayer = await this.playerService.createPlayer(req.body)
    return reply.code(200).send(createdPlayer)
  }

  @GET({
    url: "",
    options: {
      schema: GetAllPlayersSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getAllPlayers(req: RequestWithKey, reply: FastifyReply) {
    const fetchedPlayers = await this.playerService.fetchAllPlayers()
    return reply.code(200).send(fetchedPlayers)
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

  @PATCH({
    url: "/:uuid/migrate",
    options: {
      schema: PlayerMigrateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async migratePlayer(
    req: RequestWithKey<{
      Body: PlayerMigrateBodySchema
      Params: PlayerInfoParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const migratedPlayer = await this.playerService.migratePlayer(
      req.params.uuid,
      req.body
    )
    return reply.code(200).send(migratedPlayer)
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
    try {
      await this.queueService.removePlayerFromGameQueue(req.params.uuid)
    } catch (e) {
      /* empty */
    }
    try {
      await this.partyService.leaveParty(req.params.uuid)
    } catch (e) {
      /* empty */
    }
    const fetchedPlayer = await this.playerService.disconnectPlayer(
      req.params.uuid
    )
    emitter.emit("serverPlayersChanged", {})
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
    try {
      await this.partyService.transferServerParty(
        req.params.uuid,
        req.body.serverName
      )
    } catch (_) {
      /* empty */
    }
    emitter.emit("serverPlayersChanged", {})
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
        serverTypes: permission.serverTypes ? permission.serverTypes : []
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
      schema: PlayerSetPermissionGroupsSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async setPermissionGroup(
    req: RequestWithKey<{
      Params: PlayerInfoParamsSchema
      Body: PlayerPermissionGroupsBodySchema
    }>,
    reply: FastifyReply
  ) {
    const setPermissionGroup = await this.playerService.setPermissionGroups(
      req.params.uuid,
      req.body.groupNames
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

  @GET({
    url: "/online",
    options: {
      schema: PlayerGetOnlineSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getOnlinePlayers(req: RequestWithKey, reply: FastifyReply) {
    const onlinePlayers = await this.playerService.getOnlinePlayers()
    return reply.code(200).send(onlinePlayers)
  }
}
