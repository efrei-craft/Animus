import { Controller, GET, POST } from "fastify-decorators"
import {
  CreateAPIKeyBodySchema,
  CreateAPIKeySchema,
  HelloSchema
} from "../schemas/Misc.schema"
import { FastifyReply, FastifyRequest } from "fastify"
import MiscService from "../services/Misc.service"
import {HasSchemaScope} from "../../helpers/decorators/HasSchemaScope";
import {HasApiKey} from "../../helpers/decorators/HasApiKey";

@Controller({ route: "/misc" })
export default class MiscController {
  constructor(private miscService: MiscService) {}

  @POST({
    url: "/api-key",
    options: {
      schema: CreateAPIKeySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createAPIKey(
    request: FastifyRequest<{ Body: CreateAPIKeyBodySchema }>,
    reply: FastifyReply
  ) {
    const { key, description, scopes } = request.body
    const apiKey = await this.miscService.createAPIKey(key, description, scopes)
    return reply.code(200).send(apiKey)
  }

  @GET({
    url: "/hello",
    options: {
      schema: HelloSchema
    }
  })
  async ok(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({ ok: true })
  }
}
