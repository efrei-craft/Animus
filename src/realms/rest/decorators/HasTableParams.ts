import { FastifyRequest } from "fastify"

export function HasTableParams() {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const req = args[0] as FastifyRequest
      req.query = req.query as Record<string, string[]>

      const querystring = req.routeSchema.querystring as {
        properties: {
          [key: string]: {
            type: string
          }
        }
      }

      const arrayParams = Object.entries(querystring.properties).filter(
        ([, value]) => value.type === "array"
      )

      for (const [key, value] of Object.entries(req.query)) {
        if (arrayParams.some(([param]) => param === key)) {
          req.query[key] = value[0].split(",")
        }
      }

      return originalMethod.apply(this, args)
    }
  }
}
