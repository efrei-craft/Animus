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
