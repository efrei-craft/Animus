import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators"
import MemberService from "../services/Member.service"
import { HasApiKey, RequestWithKey } from "../../helpers/decorators/HasApiKey"
import { HasSchemaScope } from "../../helpers/decorators/HasSchemaScope"
import {
  MemberCreateBodySchema,
  MemberCreateSchema,
  MemberGetParamsSchema,
  MemberGetPlayerSchema,
  MemberGetSchema,
  MemberRemoveSchema,
  MemberUpdateBodySchema,
  MemberUpdateSchema,
  MembersGetSchema
} from "../schemas/Member.schema"
import { FastifyReply } from "fastify"

@Controller({ route: "/members" })
export default class MemberController {
  constructor(private memberService: MemberService) {}

  @GET({
    url: "",
    options: {
      schema: MembersGetSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getMembers(req: RequestWithKey, reply: FastifyReply) {
    const fetchedMembers = await this.memberService.getMembers()
    return reply.code(200).send(fetchedMembers)
  }

  @POST({
    url: "",
    options: {
      schema: MemberCreateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async createMember(
    req: RequestWithKey<{
      Body: MemberCreateBodySchema
    }>,
    reply: FastifyReply
  ) {
    const createdMember = await this.memberService.createMember(req.body)
    return reply.code(200).send(createdMember)
  }

  @GET({
    url: "/:discordId",
    options: {
      schema: MemberGetSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getMember(
    req: RequestWithKey<{ Params: MemberGetParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedMember = await this.memberService.getMember(
      req.params.discordId
    )
    return reply.code(200).send(fetchedMember)
  }

  @GET({
    url: "/:discordId/player",
    options: {
      schema: MemberGetPlayerSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async getMembersPlayer(
    req: RequestWithKey<{ Params: MemberGetParamsSchema }>,
    reply: FastifyReply
  ) {
    const fetchedMember = await this.memberService.getMembersPlayer(
      req.params.discordId
    )
    return reply.code(200).send(fetchedMember)
  }

  @PATCH({
    url: "/:discordId/update",
    options: {
      schema: MemberUpdateSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async updateMember(
    req: RequestWithKey<{
      Params: MemberGetParamsSchema
      Body: MemberUpdateBodySchema
    }>,
    reply: FastifyReply
  ) {
    const updatedMember = await this.memberService.updateMember(
      req.params.discordId,
      req.body
    )
    return reply.code(200).send(updatedMember)
  }

  @DELETE({
    url: "/:discordId/remove",
    options: {
      schema: MemberRemoveSchema
    }
  })
  @HasApiKey()
  @HasSchemaScope()
  async removePlayer(
    req: RequestWithKey<{ Params: MemberGetParamsSchema }>,
    reply: FastifyReply
  ) {
    const removedMember = await this.memberService.removeMember(
      req.params.discordId
    )
    return reply.code(200).send(removedMember)
  }
}
