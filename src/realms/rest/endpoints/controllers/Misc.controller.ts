import { Controller, GET } from "fastify-decorators"
import { HelloSchema } from "../schemas/Misc.schema"
import { FastifyReply, FastifyRequest } from "fastify"
import MiscService from "../services/Misc.service"

@Controller({ route: "/misc" })
export default class MiscController {
  constructor(private miscService: MiscService) {}

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
