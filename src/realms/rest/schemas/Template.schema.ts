import { Type } from "@sinclair/typebox"
import { ServerType } from "@prisma/client"

export default Type.Object(
  {
    name: Type.String({ description: "The template's name" }),
    repository: Type.String({ description: "The template's repository" }),
    type: Type.String({
      description: "The template's type",
      enum: Object.keys(ServerType)
    })
  },
  {
    $id: "Template",
    description: "The schema describing a template"
  }
)
