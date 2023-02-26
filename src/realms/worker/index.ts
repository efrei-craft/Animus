import redis from "../../clients/Redis"
import consolaGlobalInstance from "consola"
import { resolve } from "path"
import * as fs from "fs"

export class AnimusWorker {
  workerMethods = []

  private async registerWorkerMethods() {
    const handlers = await fs.promises.readdir(resolve(__dirname, "handlers"))
    for (const handler of handlers) {
      const handlerName = handler.split(".")[0]
      const handlerContent = await import(`./handlers/${handler}`)
      this.workerMethods[handlerName] = handlerContent.default
      consolaGlobalInstance.debug(
        `Registered handler ${handlerName} to AnimusWorker`
      )
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
    await this.registerWorkerMethods()
    while (true) {
      await this.handleQueues()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
