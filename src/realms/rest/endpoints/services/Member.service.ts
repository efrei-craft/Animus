import { Service } from "fastify-decorators"
import { Member, Player, Prisma } from "@prisma/client"
import prisma from "../../../../clients/Prisma"
import {
  MemberCreateBodySchema,
  MemberUpdateBodySchema
} from "../schemas/Member.schema"
import { ApiError } from "../../helpers/Error"
import PlayerService from "./Player.service"

@Service()
export default class MemberService {
  /**
   * The select object for public member data.
   * @private
   */
  public static MemberPublicSelect: Prisma.MemberSelect = {
    discordId: true,
    firstName: true,
    lastName: true,
    promo: true
  }

  createMember(body: MemberCreateBodySchema): Promise<Partial<Member>> {
    return prisma.member.create({
      data: {
        ...body
      },
      select: MemberService.MemberPublicSelect
    })
  }

  async getMember(discordId: string): Promise<Partial<Member>> {
    const result = await prisma.member.findUnique({
      where: {
        discordId: discordId
      }
    })

    if (!result) throw new ApiError("no-such-member", 404)
    return result
  }

  async getMembersPlayer(discordId: string): Promise<Partial<Player>> {
    const result = await prisma.member.findUnique({
      where: {
        discordId: discordId
      },
      select: {
        player: {
          select: PlayerService.PlayerPublicSelect
        }
      }
    })

    if (!result) throw new ApiError("no-such-member", 404)
    if (!result.player) throw new ApiError("no-player-linked", 404)
    return result.player
  }

  async updateMember(
    discordId: string,
    body: MemberUpdateBodySchema
  ): Promise<Partial<Member>> {
    const updated = await prisma.member.update({
      where: {
        discordId: discordId
      },
      data: {
        ...body
      },
      select: MemberService.MemberPublicSelect
    })

    if (!updated) throw new ApiError("no-such-member", 404)
    return updated
  }

  async removeMember(discordId: string): Promise<string> {
    const deleted = await prisma.member.delete({
      where: {
        discordId: discordId
      },
      select: {
        discordId: true
      }
    })

    if (!deleted) throw new ApiError("no-such-member", 404)
    return deleted.discordId
  }
}
