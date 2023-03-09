import { Service } from "fastify-decorators"
import {
  GameServer,
  GameStatus,
  Prisma,
  Server,
  ServerType
} from "@prisma/client"
import prisma from "../../../../clients/Prisma"
import { ApiError } from "../../helpers/Error"
import RedisClient from "../../../../clients/Redis"
import { UpdateGameServerBodySchema } from "../schemas/Server.schema"
import { removeNullUndefined } from "../../helpers/NullUndefinedRemover"
import PlayerService from "./Player.service"
import GamesService from "./Games.service"

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
    gameServer: {
      select: {
        serverName: true,
        game: {
          select: {
            ...GamesService.GamePublicSelect
          }
        },
        status: true,
        requestedGameName: true
      }
    },
    address: true,
    createdAt: true,
    updatedAt: true,
    permanent: true,
    ready: true,
    players: {
      select: {
        ...PlayerService.PlayerPublicSelect
      }
    },
    permissionToJoin: true,
    lastPlayerUpdate: true
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

    server = removeNullUndefined(server)

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
          parentTemplateName: {
            in: deployedUnder
          }
        }
      },
      select: this.ServerPublicSelect
    })

    servers = servers.map((server) => removeNullUndefined(server))
    return servers
  }

  async readyServer(name: string) {
    const server = await prisma.server.findFirst({
      where: {
        name
      },
      select: {
        ...this.ServerPublicSelect,
        template: {
          select: {
            name: true,
            type: true,
            repository: true,
            parentTemplate: {
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
      await RedisClient.getInstance().publishToPlugin(
        server.template.parentTemplate.name,
        "Vicarius",
        "addServer",
        name
      )
    }

    return removeNullUndefined(server)
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

    let game: { name: string }

    newGameServer.gameName =
      newGameServer.gameName && newGameServer.gameName.length > 0
        ? newGameServer.gameName
        : null

    console.log(newGameServer.gameName)

    if (newGameServer.gameName !== null) {
      game = await prisma.game.findFirst({
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
              gameName: newGameServer.gameName || undefined,
              status:
                newGameServer.status !== null
                  ? GameStatus[newGameServer.status]
                  : undefined
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
          gameName: newGameServer.gameName || undefined,
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

  /**
   * Transfer players to another server
   * @param serverId The server's ID
   * @param uuids The players' UUIDs
   */
  async transferPlayers(serverId: string, uuids: string[]): Promise<void> {
    const server = await prisma.server.findUnique({
      where: {
        name: serverId
      },
      select: {
        name: true,
        template: {
          select: {
            name: true,
            parentTemplate: {
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

    await RedisClient.getInstance().publishToPlugin(
      server.template.parentTemplate.name,
      "Vicarius",
      "transferPlayers",
      server.name,
      uuids.join(",")
    )
  }
}
