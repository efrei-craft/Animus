import { Service } from "fastify-decorators"
import prisma from "../../../clients/Prisma"
import { Game, Prisma } from "@prisma/client"

@Service()
export default class GamesService {
  /**
   * The select object for public Game data.
   * @private
   */
  private GamePublicSelect: Prisma.GameSelect = {
    name: true,
    color: true,
    menuMaterial: true,
    menuDescription: true,
    menuOrder: true,
    minQueueToStart: true,
    maxPlayers: true,
    templates: true,
    available: true
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
      select: this.GamePublicSelect
    })
  }
}
