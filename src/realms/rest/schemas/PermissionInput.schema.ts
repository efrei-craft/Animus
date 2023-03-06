import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    name: Type.String({
      description: "The permission identifier (used in game as the permission)"
    }),
    expires: Type.Optional(
      Type.String({
        description: "The date the permission expires (ISO 8601)"
      })
    ),
    serverTypes: Type.Array(
      Type.String({
        description: "The server types the permission is valid for"
      })
    )
  },
  {
    $id: "PermissionInput",
    description: "The schema describing a permission being inputted"
  }
)
