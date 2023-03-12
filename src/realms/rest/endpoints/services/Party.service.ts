import { Service } from "fastify-decorators"
import { Prisma } from "@prisma/client"
import prisma from "../../../../clients/Prisma"
import { ApiError } from "../../helpers/Error"
import { sendMessageToPlayer } from "../../helpers/SendMessage"
import RedisClient from "../../../../clients/Redis"
import PlayerService from "./Player.service"

@Service()
export default class PartyService {
  public static PartyPublicSelect: Prisma.PartySelect = {
    id: true,
    name: true,
    owner: {
      select: PlayerService.PlayerPublicSelect
    },
    members: {
      select: PlayerService.PlayerPublicSelect
    },
    invited: {
      select: PlayerService.PlayerPublicSelect
    },
    public: true
  }

  private static sendMessageToPlayer(
    proxyServer: string,
    uuid: string,
    message: string
  ) {
    return sendMessageToPlayer(proxyServer, "PARTY", uuid, message)
  }

  public static async sendMessageToParty(partyId: number, message: string) {
    const party = await prisma.party.findUnique({
      where: {
        id: partyId
      },
      select: {
        members: {
          select: {
            uuid: true
          }
        },
        owner: {
          select: {
            uuid: true,
            server: {
              select: {
                template: {
                  select: {
                    parentTemplateName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const allPlayerUUIDs = party.members
      .map((member) => member.uuid)
      .concat(party.owner.uuid)

    await PartyService.sendMessageToPlayer(
      party.owner.server.template.parentTemplateName,
      allPlayerUUIDs.join(","),
      message
    )
  }

  private getPartySelect(uuid: string) {
    return prisma.party.findFirst({
      where: {
        OR: [
          {
            owner: {
              uuid
            }
          },
          {
            members: {
              some: {
                uuid
              }
            }
          }
        ]
      },
      select: PartyService.PartyPublicSelect
    })
  }

  async getPlayersParty(uuid: string) {
    const party = await this.getPartySelect(uuid)

    if (!party) {
      throw new ApiError("not-in-party", 404)
    }

    return party
  }

  async createParty(owner: string) {
    const existingParty = await this.getPartySelect(owner)

    if (existingParty) {
      throw new ApiError("already-in-party", 409)
    }

    return prisma.party.create({
      data: {
        owner: {
          connect: {
            uuid: owner
          }
        }
      },
      select: PartyService.PartyPublicSelect
    })
  }

  async invitePlayer(ownerId: string, playerUuid: string) {
    let party = await this.getPartySelect(ownerId)

    const player = await prisma.player.findUnique({
      where: {
        uuid: playerUuid
      },
      select: {
        ...PlayerService.PlayerPublicSelect,
        server: {
          select: {
            template: {
              select: {
                parentTemplateName: true
              }
            }
          }
        }
      }
    })

    const owner = await prisma.player.findUnique({
      where: {
        uuid: ownerId
      },
      select: {
        ...PlayerService.PlayerPublicSelect
      }
    })

    const playerParty = await this.getPartySelect(playerUuid)

    if (playerParty) {
      throw new ApiError("player-already-in-party", 409)
    }

    if (!party && !playerParty) {
      party = await this.createParty(ownerId)
    }

    if (party.owner.uuid !== ownerId) {
      throw new ApiError("not-owner", 403)
    }

    if (ownerId === playerUuid) {
      throw new ApiError("cannot-invite-yourself", 410)
    }

    if (party.invited.some((p) => p.uuid === playerUuid)) {
      throw new ApiError("already-invited", 409)
    }

    await PartyService.sendMessageToParty(
      party.id,
      player.permGroups[0].color +
        player.username +
        " &7a été invité dans le groupe !"
    )

    await PartyService.sendMessageToPlayer(
      player.server.template.parentTemplateName,
      playerUuid,
      owner.permGroups[0].color +
        owner.username +
        "&a t'a invité dans son groupe ! &7Faites &e/party join " +
        owner.username +
        " &7pour rejoindre le groupe !"
    )

    await prisma.party.update({
      where: {
        id: party.id
      },
      data: {
        invited: {
          connect: {
            uuid: playerUuid
          }
        }
      }
    })
  }

  async joinParty(playerId: string, owner: string) {
    const player = await prisma.player.findUnique({
      where: {
        uuid: playerId
      },
      select: {
        ...PlayerService.PlayerPublicSelect
      }
    })
    const existingParty = await this.getPartySelect(playerId)

    if (existingParty) {
      throw new ApiError("already-in-party", 409)
    }

    const ownerParty = await this.getPartySelect(owner)

    if (!ownerParty) {
      throw new ApiError("owner-not-in-party", 404)
    }

    if (!ownerParty.invited.some((p) => p.uuid === playerId)) {
      throw new ApiError("not-invited", 403)
    }

    const party = await prisma.party.update({
      where: {
        id: ownerParty.id
      },
      data: {
        invited: {
          disconnect: {
            uuid: playerId
          }
        },
        members: {
          connect: {
            uuid: playerId
          }
        }
      },
      select: PartyService.PartyPublicSelect
    })

    await PartyService.sendMessageToParty(
      party.id,
      player.permGroups[0].color +
        player.username +
        " &7a &arejoint&7 le groupe !"
    )

    return party
  }

  async leaveParty(playerId: string) {
    const party = await this.getPartySelect(playerId)
    const player = await prisma.player.findUnique({
      where: {
        uuid: playerId
      },
      select: {
        ...PlayerService.PlayerPublicSelect
      }
    })

    if (!party) {
      throw new ApiError("not-in-party", 404)
    }

    if (party.owner.uuid === playerId) {
      await PartyService.sendMessageToParty(
        party.id,
        player.permGroups[0].color +
          player.username +
          " &7a &cdissout&7 le groupe !"
      )

      await prisma.party.delete({
        where: {
          id: party.id
        }
      })
    } else {
      await prisma.party.update({
        where: {
          id: party.id
        },
        data: {
          members: {
            disconnect: {
              uuid: playerId
            }
          }
        }
      })

      await PartyService.sendMessageToParty(
        party.id,
        "&b" + player.username + " &7a &cquitté&7 le groupe !"
      )

      if (party.members.length === 0) {
        await PartyService.sendMessageToParty(
          party.id,
          "&7Le groupe est vide, il a donc été &cdissout&7 !"
        )

        await prisma.party.delete({
          where: {
            id: party.id
          }
        })
      }
    }
  }

  async transferServerParty(ownerId: string, serverId: string) {
    const party = await prisma.party.findFirst({
      where: {
        owner: {
          uuid: ownerId
        }
      },
      select: {
        id: true,
        owner: {
          select: {
            uuid: true,
            server: {
              select: {
                template: {
                  select: {
                    type: true,
                    parentTemplateName: true
                  }
                }
              }
            }
          }
        },
        members: {
          select: {
            uuid: true
          }
        }
      }
    })

    if (!party) {
      throw new ApiError("party-not-found", 404)
    }

    const players = party.members.map((p) => p.uuid)

    await PartyService.sendMessageToParty(
      party.id,
      "&7Transfert du groupe sur le serveur &b" + serverId + "&7."
    )

    await RedisClient.getInstance().publishToPlugin(
      party.owner.server.template.parentTemplateName,
      "Vicarius",
      "transferPlayers",
      serverId,
      players.join(",")
    )
  }
}
