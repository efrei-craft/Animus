import { Service } from "fastify-decorators"
import { Prisma, Server } from "@prisma/client"
import prisma from "../../../clients/Prisma"
import { ApiError } from "../helpers/Error"

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

  private filterNullProperties<T>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== null)
    ) as T
  }
}
