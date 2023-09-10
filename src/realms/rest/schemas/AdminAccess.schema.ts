import { Type } from "@sinclair/typebox"
import ApiKeySchema from "./ApiKey.schema"

export default Type.Object(
  {
    name: Type.String(),
    email: Type.String(),
    nickname: Type.String(),
    groups: Type.Array(Type.String(), {
      description: "Authentik groups the admin is in"
    }),
    apiKey: Type.Optional(Type.Ref(ApiKeySchema))
  },
  { $id: "AdminAccess", description: "The schema describing an Admin Access" }
)
