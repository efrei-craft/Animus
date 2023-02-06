import { Controller, GET, POST } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../decorators/HasApiKey"
import {
  CreateGroupBodySchema,
  CreateGroupSchema,
  GetGroupSchema
} from "./schemas/Permissions.schema"
import { FastifyReply } from "fastify"
import { HasSchemaScope } from "../decorators/HasSchemaScope"
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
  @HasApiKey()
  @HasSchemaScope()
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
  @HasApiKey()
  @HasSchemaScope()
  async getGroups(req: RequestWithKey, reply: FastifyReply) {
    const groups = await this.permissionsService.getGroups()
    return reply.send(groups)
  }
}
