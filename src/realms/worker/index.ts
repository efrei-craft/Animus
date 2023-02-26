import redis from "../../clients/Redis"
import consolaGlobalInstance from "consola"
import docker from "../../clients/Docker"
import { serverNameGenerator } from "./helpers/ServerNameGenerator"
import prisma from "../../clients/Prisma"

export class AnimusWorker {
  private workerMethods = {
    "create-server": async (templateName: string) => {
      const template = await prisma.template.findUnique({
        where: {
          name: templateName
        },
        select: {
          name: true,
          repository: true
        }
      })

      if (!template) {
        throw new Error(`Template ${templateName} does not exist`)
      }

      consolaGlobalInstance.debug(
        `Creating server with the ${templateName} template...`
      )

      const serverName = serverNameGenerator(template.name)

      await docker.createContainer({
        name: serverName,
        Image: template.repository
      })

      const container = await docker.getContainer(serverName).inspect()

      console.log(container)
    }
  }

  private async handleQueues() {
    for (const [methodName, method] of Object.entries(this.workerMethods)) {
      const queueName = `queue:${methodName}`

      const queue = await redis.lpop(queueName)

      if (queue) {
        const arg = queue
        try {
          await method(arg)
          consolaGlobalInstance.success(
            `Successfully processed ${methodName} with ${arg}`
          )
        } catch (err) {
          await redis.rpush(queueName, arg)
          consolaGlobalInstance.error(
            `Error processing ${methodName} with ${arg}: ${err}`
          )
        }
      }
    }
  }

  async start() {
    consolaGlobalInstance.success(`Worker listening for queues...`)
    while (true) {
      await this.handleQueues()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
