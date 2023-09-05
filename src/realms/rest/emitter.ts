import EventEmitter from "events"
import { Emitter } from "./helpers/Emitter"
import { Static, Type } from "@sinclair/typebox"
import { SocketStream } from "@fastify/websocket"
import { WebSocket } from "ws"
import RedisClient from "../../clients/Redis"

export const websockets = new Map<SocketStream, Set<EmitterMessageType>>()

export const emitter = new EventEmitter() as Emitter<EmitterMessage>
emitter.setMaxListeners(0)

export enum EmitterMessageTypes {
  ping = "ping",
  pong = "pong",

  setSubscriptions = "setSubscriptions",
  hello = "hello",

  serverPlayersChanged = "serverPlayersChanged"
}

export type EmitterMessageType = keyof typeof EmitterMessageTypes

export const emitterMessageTypes = Type.Enum(EmitterMessageTypes)

export const emitterMessage = Type.Union(
  [
    Type.Object({
      type: Type.Literal("ping"),
      payload: Type.Null()
    }),
    Type.Object({
      type: Type.Literal("pong"),
      payload: Type.Null()
    }),
    Type.Object({
      type: Type.Literal("setSubscriptions"),
      payload: Type.Object({
        subscriptions: Type.Array(emitterMessageTypes)
      })
    }),
    Type.Object({
      type: Type.Literal("hello"),
      payload: Type.Object({
        ok: Type.Boolean()
      })
    }),
    Type.Object({
      type: Type.Literal("serverPlayersChanged"),
      payload: Type.Null()
    })
  ],
  {
    $id: "EmitterMessage"
  }
)

export type EmitterMessage = Static<typeof emitterMessage>

export const prepareRedisListeners = () => {
  const redisSubscriptionClient = new RedisClient()
  redisSubscriptionClient.client.subscribe("emitter")
  redisSubscriptionClient.client.on("message", (channel, message) => {
    if (channel === "emitter") {
      const body = JSON.parse(message.toString()) as EmitterMessage
      emitter.emit(body.type, body.payload)
    }
  })

  for (const messageType of Object.keys(EmitterMessageTypes)) {
    const type = messageType as EmitterMessageType
    emitter.on(type, (payload) => {
      for (const [connection, subscriptions] of websockets.entries()) {
        if (
          subscriptions.has(type) &&
          connection.socket.readyState === WebSocket.OPEN
        ) {
          connection.socket.send(JSON.stringify({ type, payload }))
        } else if (connection.socket.readyState !== WebSocket.OPEN) {
          websockets.delete(connection)
        }
      }
    })
  }
}

export const emitMessage = <T extends EmitterMessageType>(
  type: T,
  payload: Extract<EmitterMessage, { type: T }> extends { type: T }
    ? Extract<EmitterMessage, { type: T }>["payload"]
    : never
) => {
  RedisClient.getInstance().client.publish(
    "emitter",
    JSON.stringify({ type, payload })
  )
}
