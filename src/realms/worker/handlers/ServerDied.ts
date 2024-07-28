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

    await RedisClient.getInstance().client.del(`server:${serverName}:logs`)

    emitMessage("serverStateInfo", {
      server: serverName,
      message: `Le serveur a été supprimé.`
    })

    emitMessage("serversChanged", null)
  },
  meta: {
    queueType: "set",
    hooks: {
      docker: [DockerHookType.DIE, DockerHookType.DESTROY]
    }
  }
}
