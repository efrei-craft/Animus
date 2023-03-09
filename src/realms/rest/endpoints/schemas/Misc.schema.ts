import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import ApiKeySchema from "../../schemas/ApiKey.schema"

// scopes must check if the value is in Object.keys(ApiScope)
const CreateAPIKeyBodySchema = Type.Object({
  key: Type.String(),
  description: Type.Optional(Type.String()),
  scopes: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })
})

export const CreateAPIKeySchema: FastifySchema = {
  tags: ["misc"],
  summary: "Creates a new API key - temporarily public",
  operationId: "createAPIKey",
  body: CreateAPIKeyBodySchema,
  response: {
    200: Type.Ref(ApiKeySchema)
  }
}

export type CreateAPIKeyBodySchema = Static<typeof CreateAPIKeyBodySchema>

export const HelloSchema: FastifySchema = {
  tags: ["misc"],
  summary: "Says hello to the API - used for checking if the API is up",
  operationId: "hello",
  response: {
    200: Type.Object({
      ok: Type.Boolean()
    })
  }
}
