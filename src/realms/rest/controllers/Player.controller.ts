import { Controller, GET, POST, PUT } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasBearer, RequestWithKey } from "../decorators/HasBearer"
import { HasScope } from "../decorators/HasScope"
import { ApiScope } from "@prisma/client"
import PlayerService from "../services/Player.service"
import {
  PlayerAddPermissionGroupBodySchema,
  PlayerAddPermissionGroupSchema,
  PlayerAddPermissionsSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema,
  PlayerGetPermissionsSchema,
  PlayerInfoSchema
} from "./schemas/Player.schema"

@Controller({ route: "/players" })
export default class PlayerController {
  constructor(readonly playerService: PlayerService) {}

  @POST({
    url: "/connect",
    options: {
      schema: PlayerConnectSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS, ApiScope.SERVER] })
  async connect(
    req: RequestWithKey<{ Body: PlayerConnectBodySchema }>,
    reply: FastifyReply
  ) {
    const fetchedPlayer = await this.playerService.fetchPlayer(
      req.body.uuid,
      true,
      req.body.username
    )
    return reply.send(fetchedPlayer)
  }

  @GET({
    url: "/:uuid",
    options: {
      schema: PlayerInfoSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS] })
  async getPlayerInfo(
    req: RequestWithKey<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    const fetchedPlayer = await this.playerService.fetchPlayer(
      req.params.uuid,
      false
    )
    return reply.send(fetchedPlayer)
  }

  @GET({
    url: "/:uuid/permissions",
    options: {
      schema: PlayerGetPermissionsSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS] })
  async getPermissions(
    req: RequestWithKey<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    const permissions = await this.playerService.getPermissions(req.params.uuid)
    return reply.send(permissions)
  }

  @POST({
    url: "/:uuid/permissions",
    options: {
      schema: PlayerAddPermissionsSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS, ApiScope.SERVER] })
  async addPermissions(
    req: RequestWithKey<{
      Params: { uuid: string }
      Body: { permissions: string[] }
    }>,
    reply: FastifyReply
  ) {
    const addedPermissions = await this.playerService.addPermissions(
      req.params.uuid,
      req.body.permissions
    )
    return reply.send(addedPermissions)
  }

  @PUT({
    url: "/:uuid/groups",
    options: {
      schema: PlayerAddPermissionGroupSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS] })
  async addPermissionGroup(
    req: RequestWithKey<{
      Params: { uuid: string }
      Body: PlayerAddPermissionGroupBodySchema
    }>,
    reply: FastifyReply
  ) {
    const addedPermissionGroup = await this.playerService.addPermissionGroup(
      req.params.uuid,
      req.body.groupId
    )
    return reply.send(addedPermissionGroup)
  }
}
