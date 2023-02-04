import { Controller, POST } from "fastify-decorators"
import {
  CreateAPIKeyBodySchema,
  CreateAPIKeySchema
} from "./schemas/Misc.schema"
import { FastifyReply, FastifyRequest } from "fastify"
import MiscService from "../services/Misc.service"

@Controller({ route: "/misc" })
export default class MiscController {
  constructor(private miscService: MiscService) {}

  @POST({
    url: "/api-key",
    options: {
      schema: CreateAPIKeySchema
    }
  })
  async createAPIKey(
    request: FastifyRequest<{ Body: CreateAPIKeyBodySchema }>,
    reply: FastifyReply
  ) {
    const { key, description, scopes } = request.body
    const apiKey = await this.miscService.createAPIKey(key, description, scopes)
    return reply.code(200).send(apiKey)
  }
}
