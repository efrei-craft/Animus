import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import LogSchema from "../../schemas/Log.schema"
import { ApiScope } from "@prisma/client"

// Create Log

export const CreateLogBodySchema = Type.Omit(LogSchema, ["id", "timestamp"], {
  $id: "CreateLogBody"
})

export type CreateLogBodySchema = Static<typeof CreateLogBodySchema>

export const CreateLogSchema: FastifySchema = {
  tags: ["logs"],
  summary: "Create a log",
  operationId: "createLog",
  security: [
    {
      apiKey: [ApiScope.LOGS]
    }
  ],
  body: CreateLogBodySchema,
  response: {
    200: Type.Ref(LogSchema)
  }
}
