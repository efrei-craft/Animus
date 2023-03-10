import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PermGroupSchema from "../../schemas/PermGroup.schema"
import { ApiScope } from "@prisma/client"

const CreateGroupBodySchema = Type.Object({
  name: Type.String(),
  prefix: Type.String(),
  color: Type.String(),
  bold: Type.Boolean(),
  defaultGroup: Type.Boolean(),
  parentGroupName: Type.Optional(Type.String()),
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

const UpdateGroupSchemaParams = Type.Object({
    id: Type.Integer({
      description: "ID of the group"
    })
})

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
  }
)

export const UpdateGroupSchema: FastifySchema = {
    tags: ["permissions"],
    summary: "Updates a permission group",
    operationId: "updateGroup",
    security: [
        {
            apiKey: [ApiScope.GROUPS]
        }
    ],
    params: UpdateGroupSchemaParams,
    body: UpdateGroupBodySchema,
    response: {
        200: Type.Ref(PermGroupSchema)
    }
}

export type UpdateGroupSchemaParams = Static<typeof UpdateGroupSchemaParams>
export type UpdateGroupBodyParams = Static<typeof UpdateGroupBodySchema>

const DeleteGroupSchemaParams = Type.Object({
  id: Type.Integer({
    description: "ID of the group"
  })
})

export type DeleteGroupSchemaParams = Static<typeof DeleteGroupSchemaParams>


export const DeleteGroupSchema: FastifySchema = {
  tags: ["permissions"],
  summary: "Deletes a permission group",
  operationId: "deleteGroup",
  security: [
    {
      apiKey: [ApiScope.GROUPS]
    }
  ],
  params: DeleteGroupSchemaParams,
  response: {
    200: Type.Object({})
  }
}
