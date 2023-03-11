import { Service } from "fastify-decorators"
import prisma from "../../../../clients/Prisma"
import { Game, Prisma } from "@prisma/client"
import PlayerCountSchema from "../../schemas/PlayerCount.schema"
import { Static } from "@sinclair/typebox"

@Service()
export default class GamesService {
  /**
   * The select object for public Game data.
   * @private
   */
  public static GamePublicSelect: Prisma.GameSelect = {
    name: true,
    displayName: true,
    color: true,
    menuMaterial: true,
    menuDescription: true,
    menuOrder: true,
    minQueueToStart: true,
    maxPlayers: true,
    templates: {
      select: {
        name: true,
        repository: true,
        type: true
      }
    },
    available: true,
    permissionToPlay: true,
    _count: {
      select: {
        gameServers: true
      }
    }
  }

  /**
   * Get all available games.
   * @returns The available games.
   */
  async getAvailableGames(): Promise<Partial<Game>[]> {
    return prisma.game.findMany({
      where: {
        available: true
      },
      orderBy: {
        menuOrder: "asc"
      },
      select: GamesService.GamePublicSelect
    })
  }

  /**
   * Get all player counts for all games.
   * @returns The player counts for all games.
   */
  async getGamePlayerCounts(): Promise<
    Array<Static<typeof PlayerCountSchema>>
  > {
    const games = await prisma.game.findMany({
      where: {
        available: true
      },
      select: {
        name: true,
        gameServers: {
          select: {
            server: {
              select: {
                _count: {
                  select: {
                    players: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return games.map((game) => {
      const playerCount = game.gameServers.reduce(
        (total, gameServer) => total + gameServer.server._count.players,
        0
      )
      return {
        name: game.name,
        online: playerCount
      }
    })
  }
}
