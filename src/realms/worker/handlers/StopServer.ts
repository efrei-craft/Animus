import prisma from "../../../clients/Prisma"
import docker from "../../../clients/Docker"
import { WorkerMethod } from "../types"
import { AnimusWorker } from "../index"

export const method: WorkerMethod = {
  exec: async (serverName: string) => {
    const server = await prisma.server.findUnique({
      where: {
        name: serverName
      },
      select: {
        name: true
      }
    })

    if (!server) {
      AnimusWorker.getInstance()
        .getLogger()
        .error(`Server ${serverName} not found`)
      return
    }

    const container = await docker.getContainer(serverName)
    await container.stop()

    AnimusWorker.getInstance()
      .getLogger()
      .success(`Stopped server ${serverName}`)
  },
  meta: {
    queueType: "set"
  }
}
