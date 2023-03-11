import { Controller, DELETE, GET, PATCH, POST, PUT } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import {
  AddGroupPermissionSchema,
  CreateGroupBodySchema,
  CreateGroupSchema,
  DeleteGroupSchema,
  GetGroupSchema,
  GetGroupSchemaParams,
  GroupPermissionBodySchema,
  PlayerRemovePermissionsBodySchema,
  RemoveGroupPermissionSchema,
  UpdateGroupBodyParams,
  UpdateGroupSchema
} from "../schemas/Permissions.schema"
import { FastifyReply } from "fastify"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import PermissionsService from "../services/Permissions.service"
import { Permission } from "@prisma/client"

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
  async updateGroup(
    req: RequestWithKey<{
      Params: GetGroupSchemaParams
      Body: UpdateGroupBodyParams
    }>,
    reply: FastifyReply
  ) {
    const updatedGroup = await this.permissionsService.updateGroup(
      req.params.id,
      req.body
    )
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
  async deleteGroup(
    req: RequestWithKey<{ Params: GetGroupSchemaParams }>,
    reply: FastifyReply
  ) {
    await this.permissionsService.deleteGroup(req.params.id)
    return reply.code(200).send({})
  }

  @PUT({
    url: "/groups/:id/permissions",
    options: {
      schema: AddGroupPermissionSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async addPermissionToGroup(
    req: RequestWithKey<{
      Params: GetGroupSchemaParams
      Body: GroupPermissionBodySchema
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
    const group = await this.permissionsService.addGroupPermissions(
      req.params.id,
      permissions
    )
    return reply.code(200).send(group)
  }

  @DELETE({
    url: "/groups/:id/permissions",
    options: {
      schema: RemoveGroupPermissionSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async removePermissionFromGroup(
    req: RequestWithKey<{
      Params: GetGroupSchemaParams
      Body: PlayerRemovePermissionsBodySchema
    }>,
    reply: FastifyReply
  ) {
    const group = await this.permissionsService.removeGroupPermissions(
      req.params.id,
      req.body.permissions
    )
    return reply.code(200).send(group)
  }
}
