import { Controller, DELETE, GET, POST, PUT } from "fastify-decorators"
import PartyService from "../services/Party.service"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { FastifyReply } from "fastify"
import {
  CreatePlayersPartySchema,
  GetPlayerParamsSchema,
  GetPlayersPartySchema,
  InvitePlayerToPartyBodySchema,
  InvitePlayerToPartySchema,
  JoinPartySchema,
  LeavePartySchema
} from "../schemas/Party.schema"

@Controller({ route: "/party" })
export default class PartyController {
  constructor(readonly partyService: PartyService) {}

  @GET({
    url: "/player/:uuid",
    options: {
      schema: GetPlayersPartySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getPlayersParty(
    req: RequestWithKey<{ Params: GetPlayerParamsSchema }>,
    reply: FastifyReply
  ) {
    const party = await this.partyService.getPlayersParty(req.params.uuid)
    return reply.code(200).send(party)
  }

  @POST({
    url: "/player/:uuid",
    options: {
      schema: CreatePlayersPartySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createPlayersParty(
    req: RequestWithKey<{ Params: GetPlayerParamsSchema }>,
    reply: FastifyReply
  ) {
    const party = await this.partyService.createParty(req.params.uuid)
    return reply.code(200).send(party)
  }

  @PUT({
    url: "/player/:uuid/invite",
    options: {
      schema: InvitePlayerToPartySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async invitePlayerToParty(
    req: RequestWithKey<{
      Params: GetPlayerParamsSchema
      Body: InvitePlayerToPartyBodySchema
    }>,
    reply: FastifyReply
  ) {
    const party = await this.partyService.invitePlayer(
      req.params.uuid,
      req.body.uuid
    )
    return reply.code(200).send(party)
  }

  @PUT({
    url: "/player/:uuid/join",
    options: {
      schema: JoinPartySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async acceptPartyInvite(
    req: RequestWithKey<{
      Params: GetPlayerParamsSchema
      Body: InvitePlayerToPartyBodySchema
    }>,
    reply: FastifyReply
  ) {
    const party = await this.partyService.joinParty(
      req.params.uuid,
      req.body.uuid
    )
    return reply.code(200).send(party)
  }

  @DELETE({
    url: "/player/:uuid/leave",
    options: {
      schema: LeavePartySchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async leaveParty(
    req: RequestWithKey<{
      Params: GetPlayerParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const party = await this.partyService.leaveParty(req.params.uuid)
    return reply.code(200).send(party)
  }
}
