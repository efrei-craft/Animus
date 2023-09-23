import { Controller, POST } from "fastify-decorators"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { CreateLogBodySchema, CreateLogSchema } from "../schemas/Logs.schema"
import { FastifyReply } from "fastify"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import LogsService from "../services/Logs.service"

@Controller({
  route: "/logs"
})
export default class LogsController {
  constructor(private logService: LogsService) {}

  @POST({
    url: "",
    options: {
      schema: CreateLogSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createLog(
    req: RequestWithKey<{
      Body: CreateLogBodySchema
    }>,
    reply: FastifyReply
  ) {
    const createdLog = await this.logService.createLog(req.body)
    return reply.code(200).send(createdLog)
  }
}
