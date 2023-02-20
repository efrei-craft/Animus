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
    )
  },
  { $id: "Permission", description: "The schema describing a permission" }
)
