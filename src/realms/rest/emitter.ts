import EventEmitter from "events"
import { Emitter } from "./helpers/Emitter"
import { Static, Type } from "@sinclair/typebox"

export const emitter = new EventEmitter() as Emitter<EmitterMessage>
emitter.setMaxListeners(0)

export enum EmitterMessageTypes {
  setSubscriptions = "setSubscriptions",
  hello = "hello",

  serverPlayersChanged = "serverPlayersChanged"
}

export type EmitterMessageType = keyof typeof EmitterMessageTypes

export const emitterMessageTypes = Type.Enum(EmitterMessageTypes)

export const emitterMessage = Type.Union(
  [
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
      payload: Type.Object({})
    })
  ],
  {
    $id: "EmitterMessage"
  }
)

export type EmitterMessage = Static<typeof emitterMessage>
