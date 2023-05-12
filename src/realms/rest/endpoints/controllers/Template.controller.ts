import { Controller, GET, PATCH } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { FastifyReply } from "fastify"
import TemplateService from "../services/Template.service"
import {
  MOTDUpdateBodySchema,
  MOTDUpdateSchema,
  TemplateGetSchema,
  TemplateParamsSchema
} from "../schemas/Template.schema"

@Controller({ route: "/templates" })
export default class TemplateController {
  constructor(readonly templateService: TemplateService) {}


  @PATCH({
    url: "/motd",
    options: {
      schema: MOTDUpdateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async setMOTD(
    req: RequestWithKey<{
      // Pas nécessaire, c'est toujours le proxy qu'on update
      // Params: TemplateParamsSchema,
      Body: MOTDUpdateBodySchema
    }>,
    reply: FastifyReply
  ) {
    const updatedTemplate = await this.templateService.setMOTD(
      req.body.motd
    )
    return reply.code(200).send(updatedTemplate)
  }

  @GET({
    url: "/:name",
    options: {
      schema: TemplateGetSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getTemplate(
    req: RequestWithKey<{
      Params: TemplateParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const fetchedTemplate = await this.templateService.fetchTemplate(
      req.params.name
    )
    return reply.code(200).send(fetchedTemplate)
  }
}
