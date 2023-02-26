import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import { Static, Type } from "@sinclair/typebox"
import ServerSchema from "../../schemas/Server.schema"

const ServerInfoParamsSchema = Type.Object({
  id: Type.String()
})

export type ServerInfoParamsSchema = Static<typeof ServerInfoParamsSchema>

export const ServerInfoSchema: FastifySchema = {
  tags: ["servers"],
  summary: "Get server info",
  operationId: "getServerInfo",
  security: [
    {
      apiKey: [ApiScope.SERVER]
    }
  ],
  params: ServerInfoParamsSchema,
  response: {
    200: Type.Ref(ServerSchema),
    400: Type.Object({
      message: Type.String()
    })
  }
}
