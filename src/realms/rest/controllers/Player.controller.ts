import { Controller, DELETE, GET, POST, PUT } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import PlayerService from "../services/Player.service"
import {
  PlayerAddPermissionGroupBodySchema,
  PlayerAddPermissionGroupSchema,
  PlayerAddPermissionsSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema,
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

  @POST({
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
}
