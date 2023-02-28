import { DockerHookType, WorkerMethod } from "../types"
import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"

export const method: WorkerMethod = {
  exec: async (arg: string) => {
    await prisma.server.delete({
      where: {
        name: arg
      }
    })

    await RedisClient.getInstance().publishToPlugin(
      "proxy",
      "ACV",
      "removeServer",
      arg
    )
  },
  meta: {
    queueType: "set",
    hooks: {
      docker: [DockerHookType.DIE]
    }
  }
}
