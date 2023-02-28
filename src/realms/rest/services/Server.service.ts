import { Service } from "fastify-decorators"
import { Prisma, Server } from "@prisma/client"
import prisma from "../../../clients/Prisma"
import { ApiError } from "../helpers/Error"
import RedisClient from "../../../clients/Redis"

@Service()
export default class ServerService {
  private ServerPublicSelect: Prisma.ServerSelect = {
    name: true,
    template: true,
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
    hasNotTemplate?: string[]
  ): Promise<Partial<Server>[]> {
    let servers = await prisma.server.findMany({
      where: {
        template: {
          name: {
            in: hasTemplate,
            notIn: hasNotTemplate
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
        ready: true,
        template: {
          select: {
            name: true
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

    if (server.template.name !== "proxy") {
      RedisClient.getInstance().publishToPlugin(
        "proxy",
        "ACV",
        "addServer",
        name
      )
    }
  }

  private filterNullProperties<T>(obj: T): T {
    return Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(obj).filter(([_, v]) => v !== null)
    ) as T
  }
}
