import {Controller, GET} from "fastify-decorators";
import {FastifyReply, FastifyRequest} from "fastify";
import {HasBearer, RequestWithKey} from "../decorators/HasBearer";
import {HasScope} from "../decorators/HasScope";
import {ApiScope} from "@prisma/client";

@Controller({ route: '/players' })
export default class PlayerController {

  @GET({ url: '/connect' })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS, ApiScope.SERVER] })
  async connect(req: RequestWithKey, reply: FastifyReply) {
    return reply.send({ key: req.key });
  }

}