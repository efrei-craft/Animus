import { Service } from "fastify-decorators"
import {
  GameServer,
  GameStatus,
  Prisma,
  Server,
  ServerType
} from "@prisma/client"
import prisma from "../../../clients/Prisma"
import { ApiError } from "../helpers/Error"
import RedisClient from "../../../clients/Redis"
import { UpdateGameServerBodySchema } from "../controllers/schemas/Server.schema"

@Service()
export default class ServerService {
  private ServerPublicSelect: Prisma.ServerSelect = {
    name: true,
    template: {
      select: {
        name: true,
        repository: true,
        type: true
      }
    },
    maxPlayers: true,
    gameServer: true,
    address: true,
    createdAt: true,
    updatedAt: true,
    permanent: true,
    ready: true,
    players: true,
    permissionToJoin: true,
    lastHeartbeat: true
  }

  async fetchServer(name: string): Promise<Partial<Server>> {
    let server = await prisma.server.findFirst({
      where: {
        name
      },
      select: {
        ...this.ServerPublicSelect
      }
    })

    if (!server) {
      throw new ApiError("server-not-found", 404)
    }

    server = this.filterNullProperties<Partial<Server>>(server)

    return server
  }

  async fetchServers(
    hasTemplate?: string[],
    hasNotTemplate?: string[],
    deployedUnder?: string[]
  ): Promise<Partial<Server>[]> {
    let servers = await prisma.server.findMany({
      where: {
        template: {
          name: {
            in: hasTemplate,
            notIn: hasNotTemplate
          },
          parentTemplates: {
            some: {
              name: {
                in: deployedUnder
              }
            }
          }
        }
      },
      select: this.ServerPublicSelect
    })

    servers = servers.map((server) =>
      this.filterNullProperties<Partial<Server>>(server)
    )

    return servers
  }

  async readyServer(name: string) {
    const server = await prisma.server.findFirst({
      where: {
        name
      },
      select: {
        ...this.ServerPublicSelect,
        ready: true,
        template: {
          select: {
            name: true,
            type: true,
            repository: true,
            parentTemplates: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!server) {
      throw new ApiError("server-not-found", 404)
    }

    if (server.ready) {
      throw new ApiError("server-already-ready", 400)
    }

    await prisma.server.update({
      where: {
        name
      },
      data: {
        ready: true
      }
    })

    server.ready = true

    if (server.template.type !== ServerType.VELOCITY) {
      for (const parentTemplate of server.template.parentTemplates) {
        await RedisClient.getInstance().publishToPlugin(
          parentTemplate.name,
          "ACV",
          "addServer",
          name
        )
      }
    }

    return this.filterNullProperties(server)
  }

  async updateGameServer(
    serverId: string,
    newGameServer: UpdateGameServerBodySchema
  ) {
    const server = await prisma.server.findFirst({
      where: {
        name: serverId
      },
      select: {
        ...this.ServerPublicSelect
      }
    })

    if (!server) {
      throw new ApiError("server-not-found", 404)
    }

    const game = await prisma.game.findFirst({
      where: {
        name: newGameServer.gameName
      },
      select: {
        name: true
      }
    })

    if (!game) {
      throw new ApiError("game-not-found", 404)
    }

    let result: Partial<GameServer>

    if (server.gameServer === null) {
      const res = await prisma.server.update({
        where: {
          name: serverId
        },
        data: {
          gameServer: {
            create: {
              gameName: game.name,
              status: GameStatus[newGameServer.status]
            }
          }
        },
        select: {
          gameServer: {
            select: {
              gameName: true,
              status: true
            }
          }
        }
      })

      result = res.gameServer
    } else {
      result = await prisma.gameServer.update({
        where: {
          serverName: serverId
        },
        data: {
          gameName: newGameServer.gameName !== null ? game.name : undefined,
          status:
            newGameServer.status !== null
              ? GameStatus[newGameServer.status]
              : undefined
        },
        select: {
          gameName: true,
          status: true
        }
      })
    }

    return result
  }

  private filterNullProperties<T>(obj: T): T {
    return Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(obj).filter(([_, v]) => v !== null)
    ) as T
  }
}
