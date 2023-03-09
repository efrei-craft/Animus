import { resolve } from "path"
import * as fs from "fs"
import RedisClient from "../../../clients/Redis"
import { AnimusWorker } from "../index"

type QueueHandler = {
  pattern: string

  /**
   * Handle the queues matching the pattern
   * @param data A map with the name of the queue as key and the items in the queue as value
   */
  handle: (data: Map<string, string[]>) => Promise<void>
}

class PlayerQueueManager {
  queueHandlers: QueueHandler[] = []

  constructor() {
    this.queueHandlers = []
  }

  public async initHandlers() {
    const handlers = await fs.promises.readdir(resolve(__dirname))
    for (const handler of handlers) {
      if (handler === "index.ts") {
        continue
      }

      // handlers are classes, so we need to import them
      const handlerName = handler.split(".")[0]
      const handlerContent: QueueHandler = (await import(`./${handler}`))
        .default

      this.queueHandlers = [...this.queueHandlers, handlerContent]

      AnimusWorker.getInstance()
        .getLogger()
        .debug(`Registered ${handlerName} player queue handler`)
    }
    AnimusWorker.getInstance()
      .getLogger()
      .success(`Registered ${this.queueHandlers.length} player queue handlers`)
  }

  private async handleQueues() {
    for (const queueHandler of this.queueHandlers) {
      const keys = await RedisClient.getInstance().client.keys(
        queueHandler.pattern
      )
      const data = new Map<string, string[]>()
      for (const key of keys) {
        const type = await RedisClient.getInstance().client.type(key)
        if (type === "list") {
          const items = await RedisClient.getInstance().client.lrange(
            key,
            0,
            -1
          )
          data.set(key, items)
        } else if (type === "set") {
          const items = await RedisClient.getInstance().client.smembers(key)
          data.set(key, items)
        }
      }
      await queueHandler.handle(data)
    }
  }

  public intervalQueueHandler() {
    setInterval(() => {
      this.handleQueues()
    }, 1000)
  }
}

export { QueueHandler, PlayerQueueManager }
