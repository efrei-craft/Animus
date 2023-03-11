import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    name: Type.String({
      description: "The permission identifier (used in game as the permission)"
    }),
    serverTypes: Type.Optional(
      Type.Array(
        Type.String({
          description: "The server types the permission is valid for"
        })
      )
    )
  },
  { $id: "Permission", description: "The schema describing a permission" }
)
