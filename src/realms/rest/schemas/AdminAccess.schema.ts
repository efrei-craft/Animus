import { Type } from "@sinclair/typebox"
import ApiKeySchema from "./ApiKey.schema"

export default Type.Object(
  {
    name: Type.String({ description: "The name of the admin" }),
    email: Type.String({ description: "The email of the admin" }),
    apiKey: Type.Optional(Type.Ref(ApiKeySchema))
  },
  { $id: "AdminAccess", description: "The schema describing an Admin Access" }
)
