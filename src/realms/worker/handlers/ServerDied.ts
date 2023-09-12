import { DockerHookType, WorkerMethod } from "../types"
import prisma from "../../../clients/Prisma"
import RedisClient from "../../../clients/Redis"
import docker from "../../../clients/Docker"
import { AnimusWorker } from "../index"
import { ServerType } from "@prisma/client"
import { emitMessage } from "../../rest/emitter"

export const method: WorkerMethod = {
  exec: async ([serverName]) => {
    const serverTemplate = await prisma.server.findFirst({
      where: {
        name: serverName
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
        serverName
      )
    }

    try {
      const container = await docker.getContainer(serverName)
      await container.remove()
    } catch (e) {
      AnimusWorker.getInstance().getLogger().debug(e)
    }

    await prisma.server.delete({
      where: {
        name: serverName
      }
    })

    // ***** Partie à revoir: redémarrage de l'infra entière
    //
    // if (serverTemplate?.template.autoremove) {
    //   try {
    //     const container = await docker.getContainer(arg)
    //     await container.remove()
    //   } catch (e) {
    //     AnimusWorker.getInstance().getLogger().error(e)
    //   }

    //   await prisma.server.delete({
    //     where: {
    //       name: arg
    //     }
    //   })
    // } else {
    //   await prisma.server.update({
    //     where: {
    //       name: arg
    //     },
    //     data: {
    //       ready: false,
    //       address: null
    //     }
    //   })
    // }

    emitMessage("serversChanged", null)
  },
  meta: {
    queueType: "set",
    hooks: {
      docker: [DockerHookType.DIE, DockerHookType.DESTROY]
    }
  }
}
