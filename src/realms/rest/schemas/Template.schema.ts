import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    name: Type.String({ description: "The template's name" }),
    repository: Type.String({ description: "The template's repository" })
  },
  {
    $id: "Template",
    description: "The schema describing a template"
  }
)
