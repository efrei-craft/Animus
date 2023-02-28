import { DockerHookType, WorkerMethod } from "../types"
import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"
import docker from "../../../clients/Docker"

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

    // TODO: Have a mode where we don't remove the container so we keep the logs
    const container = await docker.getContainer(arg)
    await container.remove()
  },
  meta: {
    queueType: "set",
    hooks: {
      docker: [DockerHookType.DIE]
    }
  }
}
