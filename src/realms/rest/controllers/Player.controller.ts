import {Controller, GET, POST} from "fastify-decorators";
import {FastifyReply} from "fastify";
import {HasBearer, RequestWithKey} from "../decorators/HasBearer";
import {HasScope} from "../decorators/HasScope";
import {ApiScope} from "@prisma/client";
import PlayerService from "../services/Player.service";
import {IPlayerConnect, PlayerConnectSchema} from "../schemas/Player.schema";

@Controller({ route: '/players' })
export default class PlayerController {

  constructor(readonly playerService: PlayerService) {}

  @POST({
    url: '/connect',
    options: {
      schema: {
        tags: ['players'],
        summary: 'A player connects to the server',
        security: [
          {
            bearerAuth: []
          }
        ],
        ...PlayerConnectSchema
      }
    }
  })
  @HasBearer()
  @HasScope({ scopes: [ApiScope.PLAYERS, ApiScope.SERVER] })
  async connect(req: RequestWithKey<{ Body: IPlayerConnect }>, reply: FastifyReply) {
    const fetchedPlayer = await this.playerService.fetchPlayer(req.body.uuid, req.body.username);
    return reply.send(fetchedPlayer);
  }

}