import { DockerHookType, WorkerMethod } from "../types"
import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"
import docker from "../../../clients/Docker"
import { AnimusWorker } from "../index"

export const method: WorkerMethod = {
  exec: async (arg: string) => {
    const serverTemplate = await prisma.server.findFirst({
      where: {
        name: arg
      },
      select: {
        template: {
          select: {
            autoremove: true,
            parentTemplates: {
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

    for (const parentTemplate of serverTemplate.template.parentTemplates) {
      await RedisClient.getInstance().publishToPlugin(
        parentTemplate.name,
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
