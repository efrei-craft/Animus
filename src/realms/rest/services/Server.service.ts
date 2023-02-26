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

  async fetchServer(
    name: string,
    includeGameServer: boolean
  ): Promise<Partial<Server>> {
    const server = await prisma.server.findUnique({
      where: {
        name
      },
      select: {
        gameServer: includeGameServer,
        ...this.ServerPublicSelect
      }
    })

    if (!server) {
      throw new ApiError("server-not-found", 404)
    }

    if (!includeGameServer) {
      delete server.gameServer
    }

    return server
  }
}
