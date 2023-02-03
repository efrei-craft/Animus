import prisma from "../../../clients/Prisma"
import { Player, Prisma } from "@prisma/client"
import { Service } from "fastify-decorators"

@Service()
export default class PlayerService {
  /**
   * The select object for public player data.
   * @private
   */
  private PlayerPublicSelect: Prisma.PlayerSelect = {
    uuid: true,
    username: true,
    permGroups: {
      select: {
        id: true,
        name: true,
        prefix: true,
        color: true,
        bold: true,
        parentGroupId: true
      }
    },
    _count: {
      select: {
        friends: true
      }
    },
    lastSeen: true,
    discordUserId: true
  }

  /**
   * Creates a new player
   * @param uuid The player's UUID
   * @param username The player's username
   * @return A promise that resolves to the created player
   */
  private async createPlayer(
    uuid: string,
    username: string
  ): Promise<Partial<Player>> {
    const defaultGroups = await prisma.permGroup.findMany({
      where: {
        defaultGroup: true
      },
      select: {
        id: true
      }
    })

    return prisma.player.create({
      data: {
        uuid,
        username,
        permGroups: {
          connect: defaultGroups.map((group) => {
            return {
              id: group.id
            }
          })
        }
      },
      select: this.PlayerPublicSelect
    })
  }

  /**
   * Fetches a player from the database, if the player does not exist, it will be created
   * @param uuid The player's UUID
   * @param username The player's username
   * @return A promise that resolves to the fetched player
   */
  async fetchPlayer(uuid: string, username: string): Promise<Partial<Player>> {
    try {
      const player = await prisma.player.findUnique({
        where: {
          uuid: uuid
        },
        select: this.PlayerPublicSelect
      })
      if (player) {
        await prisma.player.update({
          where: {
            uuid: uuid
          },
          data: {
            lastSeen: new Date()
          }
        })
      } else {
        return this.createPlayer(uuid, username)
      }
      return player
    } catch (e) {
      throw new Error(e.message)
    }
  }
}
