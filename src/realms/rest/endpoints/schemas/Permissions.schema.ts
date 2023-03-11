import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PermGroupSchema from "../../schemas/PermGroup.schema"
import { ApiScope } from "@prisma/client"
import PermissionInputSchema from "../../schemas/PermissionInput.schema"
import PermissionSchema from "../../schemas/Permission.schema"

const GetGroupSchemaParams = Type.Object({
  id: Type.Integer({
    description: "ID of the group"
  })
})

export type GetGroupSchemaParams = Static<typeof GetGroupSchemaParams>

// Create Group

const CreateGroupBodySchema = Type.Object({
  name: Type.String(),
  prefix: Type.String(),
  color: Type.String(),
  bold: Type.Boolean(),
  defaultGroup: Type.Boolean(),
  parentGroupName: Type.Optional(Type.String())
})

export const CreateGroupSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Creates a permission group",
  operationId: "createGroup",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  body: CreateGroupBodySchema,
  response: {
    200: Type.Ref(PermGroupSchema)
  }
}

export type CreateGroupBodySchema = Static<typeof CreateGroupBodySchema>

// Get Groups

export const GetGroupSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Gets all permission groups",
  operationId: "getGroups",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  response: {
    200: Type.Array(Type.Ref(PermGroupSchema))
  }
}

// Update Group

const UpdateGroupBodySchema = Type.Object({
  name: Type.Optional(Type.String()),
  prefix: Type.Optional(Type.String()),
  color: Type.Optional(Type.String()),
  bold: Type.Optional(Type.Boolean()),
  defaultGroup: Type.Optional(Type.Boolean()),
  parentGroupName: Type.Optional(Type.String()),
  forceReplace: Type.Boolean({
    default: false,
    description: "If true, replaces the default group if it exists"
  })
})

export const UpdateGroupSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Updates a permission group",
  operationId: "updateGroup",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  params: GetGroupSchemaParams,
  body: UpdateGroupBodySchema,
  response: {
    200: Type.Ref(PermGroupSchema)
  }
}

export type UpdateGroupBodyParams = Static<typeof UpdateGroupBodySchema>

// Delete Group

export const DeleteGroupSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Deletes a permission group",
  operationId: "deleteGroup",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  params: GetGroupSchemaParams,
  response: {
    200: Type.Object({})
  }
}

// Add Group Permission

const GroupPermissionBodySchema = Type.Object({
  permissions: Type.Array(Type.Ref(PermissionInputSchema))
})

export type GroupPermissionBodySchema = Static<typeof GroupPermissionBodySchema>

export const AddGroupPermissionSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Adds a permission to a group",
  operationId: "addGroupPermission",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  params: GetGroupSchemaParams,
  body: GroupPermissionBodySchema,
  response: {
    200: Type.Array(Type.Ref(PermissionSchema)),
    404: Type.Object({
      error: Type.String({ enum: ["group-not-found"] })
    })
  }
}

// Remove Group Permission

const PlayerRemovePermissionsBodySchema = Type.Object({
  permissions: Type.Array(Type.String())
})

export type PlayerRemovePermissionsBodySchema = Static<
  typeof PlayerRemovePermissionsBodySchema
>

export const RemoveGroupPermissionSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Removes a permission from a group",
  operationId: "removeGroupPermission",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  params: GetGroupSchemaParams,
  body: PlayerRemovePermissionsBodySchema,
  response: {
    200: Type.Array(Type.Ref(PermissionSchema)),
    404: Type.Object({
      error: Type.String({ enum: ["group-not-found"] })
    })
  }
}
