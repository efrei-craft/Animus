import { Service } from "fastify-decorators"
import { SocketStream } from "@fastify/websocket"
import { EmitterMessage, emitMessage, websockets } from "../../emitter"
import { AnimusRestServer } from "../.."
import { WebSocket } from "ws"

@Service()
export default class MiscService {
  handleWebSocket(connection: SocketStream) {
    AnimusRestServer.getInstance().getLogger().debug("New websocket connection")

    const handleMessage = (message: string) => {
      try {
        const body = JSON.parse(message.toString()) as EmitterMessage

        if (body.type === "setSubscriptions") {
          const subscriptions = new Set(body.payload.subscriptions)
          websockets.set(connection, subscriptions)
        } else if (body.type === "hello") {
          emitMessage("hello", { ok: true })
        } else if (body.type === "ping") {
          connection.socket.send(JSON.stringify({ type: "pong" }))
        }
      } catch (e) {
        connection.socket.off("message", handleMessage)
      }
    }

    connection.socket.on("message", handleMessage)

    connection.socket.on("close", () => {
      websockets.delete(connection)

      AnimusRestServer.getInstance()
        .getLogger()
        .debug("Websocket connection closed")
    })

    const pingInterval = setInterval(() => {
      if (connection.socket.readyState !== WebSocket.OPEN) {
        clearInterval(pingInterval)
        return
      }
      connection.socket.send(JSON.stringify({ type: "ping" }))
    }, 10000)
  }
}
