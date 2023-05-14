import { Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"


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
