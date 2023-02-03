import { FastifyReply, FastifyRequest } from "fastify"
import { RouteGenericInterface } from "fastify/types/route"
import { ApiKey, bearerToken } from "../helpers/Auth"

export type RequestWithKey<
  RouteGeneric extends RouteGenericInterface = object
> = FastifyRequest<RouteGeneric> & {
  key: ApiKey
}

export function HasBearer() {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const req = args[0] as RequestWithKey
      const res = args[1] as FastifyReply
      const auth = req.headers.authorization
      try {
        req.key = await bearerToken(auth)
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
