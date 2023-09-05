import { Service } from "fastify-decorators"
import { SocketStream } from "@fastify/websocket"
import {
  EmitterMessage,
  EmitterMessageType,
  EmitterMessageTypes,
  emitter
} from "../../emitter"
import { AnimusRestServer } from "../.."
import { WebSocket } from "ws"

@Service()
export default class MiscService {
  websockets = new Map<SocketStream, Set<EmitterMessageType>>()

  constructor() {
    this.prepareListeners()
  }

  private prepareListeners() {
    for (const messageType of Object.keys(EmitterMessageTypes)) {
      const type = messageType as EmitterMessageType
      emitter.on(type, (payload) => {
        for (const [connection, subscriptions] of this.websockets.entries()) {
          if (
            subscriptions.has(type) &&
            connection.socket.readyState === WebSocket.OPEN
          ) {
            connection.socket.send(JSON.stringify({ type, payload }))
          } else if (connection.socket.readyState !== WebSocket.OPEN) {
            this.websockets.delete(connection)
          }
        }
      })
    }
  }

  handleWebSocket(connection: SocketStream) {
    AnimusRestServer.getInstance().getLogger().debug("New websocket connection")

    const handleMessage = (message: string) => {
      try {
        const body = JSON.parse(message.toString()) as EmitterMessage

        if (body.type === "setSubscriptions") {
          const subscriptions = new Set(body.payload.subscriptions)
          this.websockets.set(connection, subscriptions)
        } else if (body.type === "hello") {
          emitter.emit("hello", { ok: true })
        } else if (body.type === "ping") {
          connection.socket.send(JSON.stringify({ type: "pong" }))
        }
      } catch (e) {
        connection.socket.off("message", handleMessage)
      }
    }

    connection.socket.on("message", handleMessage)

    connection.socket.on("close", () => {
      this.websockets.delete(connection)

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
