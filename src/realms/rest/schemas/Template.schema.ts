import { Type } from "@sinclair/typebox"
import { ServerType } from "@prisma/client"

export default Type.Object(
  {
    name: Type.String({ description: "The template's name" }),
    repository: Type.String({ description: "The template's repository" }),
    type: Type.String({
      description: "The template's type",
      enum: Object.keys(ServerType)
    }),
    motd: Type.Optional(
      Type.String({
        description:
          "The template's motd. As of now, only used for proxy servers"
      })
    ),
    permissionToJoin: Type.String({
      description: "The server's permission to join",
      default: ""
    })
  },
  {
    $id: "Template",
    description: "The schema describing a template"
  }
)
