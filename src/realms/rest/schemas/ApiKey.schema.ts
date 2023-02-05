import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    key: Type.String(),
    description: Type.Optional(Type.String()),
    scopes: Type.Array(Type.String(), { minItems: 1 })
  },
  { $id: "ApiKey" }
)
