import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import TemplateSchema from "../../schemas/Template.schema"

const TemplateParamsSchema = Type.Object({
  name: Type.String()
})

export type TemplateParamsSchema = Static<typeof TemplateParamsSchema>

const MOTDUpdateBodySchema = Type.Object({
  motd: Type.String()
})

export type MOTDUpdateBodySchema = Static<typeof MOTDUpdateBodySchema>

export const MOTDUpdateSchema: FastifySchema = {
  tags: ["templates"],
  summary: "Update the MOTD of a template",
  operationId: "updateTemplateMOTD",
  security: [
    {
      apiKey: [ApiScope.TEMPLATES]
    }
  ],
  // params: TemplateParamsSchema,
  body: MOTDUpdateBodySchema,
  response: {
    200: Type.Ref(TemplateSchema)
  }
}

export const TemplateGetSchema: FastifySchema = {
  tags: ["templates"],
  summary: "Get a template",
  operationId: "getTemplate",
  security: [
    {
      apiKey: [ApiScope.TEMPLATES]
    }
  ],
  params: TemplateParamsSchema,
  response: {
    200: Type.Ref(TemplateSchema),
    404: Type.Object({
      error: Type.String({ enum: ["template-not-found"] })
    })
  }
}