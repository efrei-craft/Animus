import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"
import { AnimusWorker } from "../index"

export default class GameServerWatcher {
  private async getServersToReset() {
    const servers = await prisma.server.findMany({
      where: {
        permanent: false,
        ready: true,
        gameServer: {
          requestedGameName: {
            not: null
          }
        },
        lastPlayerUpdate: {
          lt: new Date(Date.now() - 1000 * 60 * 5)
        }
      },
      select: {
        name: true,
        _count: {
          select: {
            players: true
          }
        },
        gameServer: {
          select: {
            requestedGame: {}
          }
        }
      }
    })

    return servers.filter((server) => server._count.players === 0)
  }

  private async getServersToKill() {
    const servers = await prisma.server.findMany({
      where: {
        permanent: false,
        ready: true,
        gameServer: {
          requestedGameName: null
        },
        lastPlayerUpdate: {
          lt: new Date(Date.now() - 1000 * 60 * 2)
        }
      },
      select: {
        name: true,
        _count: {
          select: {
            players: true
          }
        }
      }
    })

    return servers.filter((server) => server._count.players === 0)
  }

  public async watch() {
    AnimusWorker.getInstance()
      .getLogger()
      .ready(`Watching for gameservers to reset, kill or create.`)
    setInterval(async () => {
      const serversToReset = await this.getServersToReset()
      const serversToKill = await this.getServersToKill()

      for (const server of serversToReset) {
        AnimusWorker.getInstance()
          .getLogger()
          .info(`Resetting server ${server.name}`)

        await RedisClient.getInstance().publishToPlugin(
          server.name,
          "LudosCore",
          "resetServer"
        )

        await prisma.server.update({
          where: {
            name: server.name
          },
          data: {
            gameServer: {
              update: {
                gameName: null,
                requestedGameName: null
              }
            }
          }
        })
      }

      for (const server of serversToKill) {
        AnimusWorker.getInstance()
          .getLogger()
          .info(`Killing server ${server.name}`)
        await AnimusWorker.getInstance().insertIntoQueue(
          "StopServer",
          server.name
        )
      }
    }, 10e3)
  }
}
