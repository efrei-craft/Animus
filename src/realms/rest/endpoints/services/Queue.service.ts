import { Service } from "fastify-decorators"
import { ApiError } from "../../helpers/Error"
import prisma from "../../../../clients/Prisma"
import RedisClient from "../../../../clients/Redis"
import { sendMessageToPlayer } from "../../helpers/SendMessage"
import PartyService from "./Party.service"

@Service()
export default class QueueService {
  private async getPlayersCurrentQueue(playerIdWithProxy: string) {
    const queueKeys = await RedisClient.getInstance().client.keys(
      "games:queue:*"
    )
    let queueName: string = null
    for (const key of queueKeys) {
      const res = await RedisClient.getInstance().client.sismember(
        key,
        playerIdWithProxy
      )
      if (res) {
        queueName = key
        break
      }
    }
    return queueName
  }

  async addPlayerToGameQueue(gameName: string, playerId: string) {
    const player = await prisma.player.findFirst({
      where: {
        uuid: playerId
      },
      select: {
        uuid: true,
        server: {
          select: {
            name: true,
            template: {
              select: {
                parentTemplate: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        party: {
          select: {
            id: true
          }
        }
      }
    })

    const game = await prisma.game.findFirst({
      where: {
        name: gameName
      },
      select: {
        color: true,
        displayName: true
      }
    })

    if (!player) {
      return false
    }

    if (!game) {
      return false
    }

    const nameWithProxy =
      player.server.template.parentTemplate.name + ":" + player.uuid

    const currentQueue: string = await this.getPlayersCurrentQueue(
      nameWithProxy
    )
    if (currentQueue) {
      await RedisClient.getInstance().client.srem(currentQueue, nameWithProxy)
    }

    await RedisClient.getInstance().client.sadd(
      "games:queue:" + gameName,
      nameWithProxy
    )

    if (player.party) {
      await PartyService.sendMessageToParty(
        player.party.id,
        "&7Le groupe a &arejoint&7 la file d'attente pour le jeu " +
          game.color +
          game.displayName +
          "&7."
      )
    } else {
      await sendMessageToPlayer(
        player.server.template.parentTemplate.name,
        "QUEUE",
        player.uuid,
        "&7Vous avez &arejoint&7 la file d'attente pour le jeu " +
          game.color +
          game.displayName +
          "&7."
      )
    }
  }

  async removePlayerFromGameQueue(playerId: string) {
    const player = await prisma.player.findFirst({
      where: {
        uuid: playerId
      },
      select: {
        uuid: true,
        server: {
          select: {
            name: true,
            template: {
              select: {
                parentTemplate: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        party: {
          select: {
            id: true
          }
        }
      }
    })

    if (!player) {
      return false
    }

    const nameWithProxy =
      player.server.template.parentTemplate.name + ":" + player.uuid
    const currentQueue: string = await this.getPlayersCurrentQueue(
      nameWithProxy
    )

    if (!currentQueue) {
      throw new ApiError("player-not-in-queue", 400)
    }

    await RedisClient.getInstance().client.srem(currentQueue, nameWithProxy)

    if (player.party) {
      await PartyService.sendMessageToParty(
        player.party.id,
        "&7Le groupe a &cquitté&7 la file d'attente."
      )
    } else {
      await sendMessageToPlayer(
        player.server.template.parentTemplate.name,
        "QUEUE",
        player.uuid,
        "&7Vous avez &cquitté&7 la file d'attente."
      )
    }
  }
}
