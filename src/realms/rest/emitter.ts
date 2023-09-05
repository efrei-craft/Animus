import EventEmitter from "events"
import { Emitter } from "./helpers/Emitter"
import { Static, Type } from "@sinclair/typebox"

export const emitter = new EventEmitter() as Emitter<EmitterMessage>
emitter.setMaxListeners(0)

export enum EmitterMessageTypes {
  SET_SUBSCRIPTIONS = "SET_SUBSCRIPTIONS",
  HELLO = "HELLO",

  ONLINE_PLAYERS_CHANGED = "ONLINE_PLAYERS_CHANGED"
}

export type EmitterMessageType = keyof typeof EmitterMessageTypes

export const emitterMessageTypes = Type.Enum(EmitterMessageTypes)

export const emitterMessage = Type.Union(
  [
    Type.Object({
      type: Type.Literal("SET_SUBSCRIPTIONS"),
      payload: Type.Object({
        subscriptions: Type.Array(emitterMessageTypes)
      })
    }),
    Type.Object({
      type: Type.Literal("HELLO"),
      payload: Type.Object({
        ok: Type.Boolean()
      })
    }),
    Type.Object({
      type: Type.Literal("ONLINE_PLAYERS_CHANGED"),
      payload: Type.Object({})
    })
  ],
  {
    $id: "EmitterMessage"
  }
)

export type EmitterMessage = Static<typeof emitterMessage>
