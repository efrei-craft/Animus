import { Controller, GET, POST } from "fastify-decorators"
import { FastifyReply } from "fastify"
import { HasBearer, RequestWithKey } from "../decorators/HasBearer"
import { HasScope } from "../decorators/HasScope"
import { ApiScope } from "@prisma/client"
import PlayerService from "../services/Player.service"
import {
  PlayerAddPermissionsSchema,
  PlayerConnectBodySchema,
  PlayerConnectSchema,
  PlayerGetPermissionsSchema
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
      req.body.username
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
  @HasScope({ scopes: [ApiScope.PLAYERS, ApiScope.SERVER] })
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
}
