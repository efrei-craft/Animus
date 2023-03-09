import { hasAuthorization } from "../Auth"
import { RequestWithKey } from "./HasApiKey"
import { FastifyReply } from "fastify"
import { ApiScope } from "@prisma/client"

/**
 * Decorator to check if the bearer token has the required scope.<br/>
 * The required scopes are defined in the schema under security.apiKey
 * @constructor
 */
export function HasSchemaScope() {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const req = args[0] as RequestWithKey
      const res = args[1] as FastifyReply
      const scopes = req.routeSchema.security.find((s) => s["apiKey"])
        .apiKey as ApiScope[]

      try {
        hasAuthorization(scopes, req.key)
      } catch (e) {
        return res.status(401).send({
          error: e.message,
          statusCode: 401
        })
      }

      return originalMethod.apply(this, args)
    }
  }
}
