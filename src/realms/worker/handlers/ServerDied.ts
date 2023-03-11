import { DockerHookType, WorkerMethod } from "../types"
import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"
import docker from "../../../clients/Docker"
import { AnimusWorker } from "../index"
import { ServerType } from "@prisma/client"

export const method: WorkerMethod = {
  exec: async (arg: string) => {
    const serverTemplate = await prisma.server.findFirst({
      where: {
        name: arg
      },
      select: {
        template: {
          select: {
            type: true,
            autoremove: true,
            parentTemplate: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!serverTemplate) {
      return
    }

    if (serverTemplate.template.type !== ServerType.VELOCITY) {
      await RedisClient.getInstance().publishToPlugin(
        serverTemplate.template.parentTemplate.name,
        "Vicarius",
        "removeServer",
        arg
      )
    }

    if (serverTemplate?.template.autoremove) {
      try {
        const container = await docker.getContainer(arg)
        await container.remove()
      } catch (e) {
        AnimusWorker.getInstance().getLogger().error(e)
      }
    }

    await prisma.server.delete({
      where: {
        name: arg
      }
    })
  },
  meta: {
    queueType: "set",
    hooks: {
      docker: [DockerHookType.DIE]
    }
  }
}
