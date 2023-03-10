import {Controller, DELETE, GET, PATCH, POST} from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import {
  CreateGroupBodySchema,
  CreateGroupSchema,
  DeleteGroupSchema,
  DeleteGroupSchemaParams,
  GetGroupSchema, UpdateGroupBodyParams, UpdateGroupSchema, UpdateGroupSchemaParams
} from "../schemas/Permissions.schema"
import { FastifyReply } from "fastify"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
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
    return reply.code(200).send(createdGroup)
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
    return reply.code(200).send(groups)
  }

  @PATCH({
    url: "/groups/:id",
    options: {
        schema: UpdateGroupSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async updateGroup(req: RequestWithKey<{
    Params: UpdateGroupSchemaParams,
    Body: UpdateGroupBodyParams
  }>, reply: FastifyReply) {
    const updatedGroup = await this.permissionsService.updateGroup(req.params.id, req.body);
    return reply.code(200).send(updatedGroup)
  }

  @DELETE({
    url: "/groups/:id",
    options: {
      schema: DeleteGroupSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async deleteGroup(req: RequestWithKey<{Params: DeleteGroupSchemaParams}>, reply: FastifyReply) {
    await this.permissionsService.deleteGroup(req.params.id)
    return reply.code(200).send({})
  }
}
