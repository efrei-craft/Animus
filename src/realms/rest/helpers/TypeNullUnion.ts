import { TSchema, Type } from "@sinclair/typebox"

export function TypeNullUnion(type: TSchema) {
  return Type.Union([type, Type.Null()])
}
