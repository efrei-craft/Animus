import { Controller, GET } from "fastify-decorators"
import { HelloSchema, WebSocketSchema } from "../schemas/Misc.schema"
import { FastifyReply, FastifyRequest } from "fastify"
import { SocketStream } from "@fastify/websocket"
import MiscService from "../services/Misc.service"
import { IsWSAuthenticated } from "../../helpers/decorators/IsWSAuthenticated"

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

  @GET({
    url: "/ws",
    options: {
      websocket: true,
      schema: WebSocketSchema
    }
  })
  @IsWSAuthenticated()
  async ws(connection: SocketStream) {
    this.miscService.handleWebSocket(connection)
  }
}
