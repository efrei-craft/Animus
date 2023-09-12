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
          lt: new Date(Date.now() - 1000 * 60)
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
        template: {
          select: {
            minimumServers: true,
            _count: {
              select: {
                servers: {
                  where: {
                    permanent: false
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            players: true
          }
        }
      }
    })

    let serversToKill = servers.filter((server) => server._count.players === 0)

    for (const server of serversToKill) {
      if (
        server.template.minimumServers &&
        server.template._count.servers <= server.template.minimumServers
      ) {
        serversToKill = serversToKill.filter((s) => s.name !== server.name)
      }
    }

    return serversToKill
  }

  private async getServersToCreate() {
    const templates = await prisma.template.findMany({
      where: {
        minimumServers: {
          gt: 0
        }
      },
      select: {
        name: true,
        minimumServers: true,
        _count: {
          select: {
            servers: {
              where: {
                permanent: false
              }
            }
          }
        }
      }
    })

    const serversToCreatePerTemplate: Array<string> = []
    for (const template of templates) {
      const serversToCreate = template.minimumServers - template._count.servers
      if (serversToCreate > 0) {
        for (let i = 0; i < serversToCreate; i++) {
          serversToCreatePerTemplate.push(template.name)
        }
      }
    }

    return serversToCreatePerTemplate
  }

  public async watch() {
    AnimusWorker.getInstance()
      .getLogger()
      .ready(`Watching for gameservers to reset, kill or create.`)
    setInterval(async () => {
      const serversToReset = await this.getServersToReset()
      const serversToKill = await this.getServersToKill()
      const serversToCreate = await this.getServersToCreate()

      for (const server of serversToReset) {
        AnimusWorker.getInstance()
          .getLogger()
          .info(`Watcher: Resetting server ${server.name}`)

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
          .info(`Watcher: Killing server ${server.name}`)
        await AnimusWorker.getInstance().insertIntoQueue(
          "StopServer",
          server.name
        )
      }

      for (const template of serversToCreate) {
        AnimusWorker.getInstance()
          .getLogger()
          .info(`Watcher: Creating server with the ${template} template`)
        await AnimusWorker.getInstance().insertIntoQueue(
          "CreateServer",
          template
        )
      }
    }, 10e3)
  }
}
