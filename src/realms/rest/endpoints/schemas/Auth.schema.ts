import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import AdminAccessSchema from "../../schemas/AdminAccess.schema"

// Federated Login - Get the URL to redirect the user to for federated login

export const FederatedLoginBody = Type.Object({
  redirect: Type.String()
})

export type FederatedLoginBody = Static<typeof FederatedLoginBody>

export const FederatedLoginSchema: FastifySchema = {
  tags: ["auth"],
  summary: "Get the URL to redirect the user to for federated login",
  operationId: "federatedLogin",
  response: {
    200: FederatedLoginBody
  }
}

// Federated Callback - Redeem the code for a user token

export const FederatedCallbackBodySchema = Type.Object({
  code: Type.String()
})

export type FederatedCallbackBody = Static<typeof FederatedCallbackBodySchema>

export const FederatedCallbackSchema: FastifySchema = {
  tags: ["auth"],
  summary: "Redeem the code for a user token",
  operationId: "federatedCallback",
  body: FederatedCallbackBodySchema,
  response: {
    200: Type.Ref(AdminAccessSchema)
  }
}
