import { Service } from "fastify-decorators"
import { CreateLogBodySchema } from "../schemas/Logs.schema"
import { Prisma } from "@prisma/client"
import prisma from "../../../../clients/Prisma"

@Service()
export default class LogService {
  public static LogPublicSelect: Prisma.LogSelect = {
    id: true,
    timestamp: true,
    message: true,
    level: true,
    data: true,
    serverName: true,
    gameServerName: true,
    playerUuid: true,
    templateName: true,
    from: true
  }

  createLog(body: CreateLogBodySchema) {
    return prisma.log.create({
      data: {
        ...body
      },
      select: LogService.LogPublicSelect
    })
  }
}
