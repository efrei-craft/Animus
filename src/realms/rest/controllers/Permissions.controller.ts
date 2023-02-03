import { Controller, GET, POST } from "fastify-decorators"
import { HasBearer, RequestWithKey } from "../decorators/HasBearer"
import {
  CreateGroupBodySchema,
  CreateGroupSchema,
  GetGroupSchema
} from "./schemas/Permissions.schema"
import { FastifyReply } from "fastify"
import { HasScope } from "../decorators/HasScope"
import { ApiScope } from "@prisma/client"
import PermissionsService from "../services/Permissions.service"

@Controller({ route: "/permissions" })
export default class PermissionsController {
  constructor(readonly permissionsService: PermissionsService) {}

  @POST({
    url: "/groups",
    options: {
      schema: CreateGroupSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.GROUPS] })
  async createGroup(
    req: RequestWithKey<{ Body: CreateGroupBodySchema }>,
    reply: FastifyReply
  ) {
    const createdGroup = await this.permissionsService.createGroup(req.body)
    return reply.send(createdGroup)
  }

  @GET({
    url: "/groups",
    options: {
      schema: GetGroupSchema
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.GROUPS] })
  async getGroups(req: RequestWithKey, reply: FastifyReply) {
    const groups = await this.permissionsService.getGroups()
    return reply.send(groups)
  }
}
