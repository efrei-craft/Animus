import { FastifyRequest } from "fastify"
import { RouteGenericInterface } from "fastify/types/route"
import { ApiKey, fetchApiKey } from "../Auth"
import { SocketStream } from "@fastify/websocket"

export type RequestWithKey<
  RouteGeneric extends RouteGenericInterface = object
> = FastifyRequest<RouteGeneric> & {
  key: ApiKey
}

/**
 * Asks the client for an API key and validates it.
 * @returns
 */
export function IsWSAuthenticated() {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: never[]) {
      const connection = args[0] as SocketStream
      const req = args[1] as RequestWithKey

      try {
        const key = (await new Promise((resolve, reject) => {
          const handleMessage = (message: string) => {
            try {
              const body = JSON.parse(message.toString())
              const key = body.key as string
              connection.socket.off("message", handleMessage)
              resolve(key)
            } catch (e) {
              connection.socket.off("message", handleMessage)
              reject(e)
            }
          }

          connection.socket.on("message", handleMessage)
        })) as string

        req.key = await fetchApiKey(key)

        connection.socket.send(
          JSON.stringify({ type: "HELLO", payload: { ok: true } })
        )
      } catch (e) {
        connection.socket.close(401, e.message)
      }

      return originalMethod.apply(this, args)
    }
  }
}
