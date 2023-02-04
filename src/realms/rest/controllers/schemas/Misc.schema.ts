import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import ApiKeySchema from "../../schemas/ApiKey.schema"

const CreateAPIKeyBodySchema = Type.Object({
  key: Type.String(),
  description: Type.Optional(Type.String()),
  scopes: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })
})

export const CreateAPIKeySchema: FastifySchema = {
  tags: ["misc"],
  summary: "Creates a new API key",
  security: [
    {
      bearerAuth: []
    }
  ],
  body: CreateAPIKeyBodySchema,
  response: {
    200: Type.Ref(ApiKeySchema)
  }
}

export type CreateAPIKeyBodySchema = Static<typeof CreateAPIKeyBodySchema>
