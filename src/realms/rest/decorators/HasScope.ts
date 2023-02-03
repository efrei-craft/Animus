import { scopeToken } from "../helpers/Auth"
import { RequestWithKey } from "./HasBearer"
import { ApiScope } from "@prisma/client"
import { FastifyReply } from "fastify"

export function HasScope(
  { scopes = [] }: { scopes?: ApiScope[] } = {
    scopes: []
  }
) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const req = args[0] as RequestWithKey
      const res = args[1] as FastifyReply

      try {
        scopeToken(scopes, req.key)
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
