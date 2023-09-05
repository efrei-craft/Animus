import { ApiScope } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { emitterMessage } from "../../emitter"

// Hello

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

// WebSocket

export const WebSocketSchema: FastifySchema = {
  tags: ["misc"],
  summary: "Handles WebSocket connections",
  operationId: "ws",
  security: [
    {
      apiKey: [ApiScope.MISC]
    }
  ],
  response: {
    200: emitterMessage
  }
}
