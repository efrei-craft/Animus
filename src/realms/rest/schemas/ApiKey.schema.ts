import { Type } from "@sinclair/typebox"
import { ApiScope } from "@prisma/client"
import { TypeNullUnion } from "../helpers/TypeNullUnion"

export default Type.Object(
  {
    key: Type.String({ description: "The API key" }),
    description: TypeNullUnion(
      Type.String({ description: "The API key's description" })
    ),
    scopes: Type.Array(Type.String(), {
      enum: Object.keys(ApiScope),
      description: "The API key's allowed scopes"
    })
  },
  { $id: "ApiKey", description: "The schema describing an API key for Animus" }
)
