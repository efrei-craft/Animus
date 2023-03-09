import { resolve } from "path"
import * as fs from "fs"
import RedisClient from "../../../clients/Redis"
import { AnimusWorker } from "../index"

type QueueHandler = {
  name: string

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
      const handlerContent: Partial<QueueHandler> = (
        await import(`./${handler}`)
      ).default

      this.queueHandlers = [
        ...this.queueHandlers,
        {
          name: handlerName,
          ...handlerContent
        } as QueueHandler
      ]

      AnimusWorker.getInstance()
        .getLogger()
        .debug(`Registered ${handlerName} player queue handler`)

      await RedisClient.getInstance().client.sadd(
        "handlers:player-queues",
        handlerName
      )
    }

    AnimusWorker.getInstance()
      .getLogger()
      .success(`Registered ${this.queueHandlers.length} player queue handlers`)
  }

  private async handleQueues() {
    const handlersToCheck = await RedisClient.getInstance().client.smembers(
      "handlers:player-queues"
    )
    for (const handler of handlersToCheck) {
      if (handler === "") {
        continue
      }

      const queueHandler = this.queueHandlers.find((qh) => qh.name === handler)
      if (!queueHandler) {
        AnimusWorker.getInstance()
          .getLogger()
          .error(
            `Handler ${handler} is registered but not found in the handlers array`
          )
        continue
      }

      await RedisClient.getInstance().client.srem(
        "handlers:player-queues",
        handler
      )

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

      await RedisClient.getInstance().client.sadd(
        "handlers:player-queues",
        handler
      )
    }
  }

  public intervalQueueHandler() {
    const interval = Math.floor(Math.random() * 1000) + 1000
    setInterval(() => {
      this.handleQueues()
    }, interval)
  }
}

export { QueueHandler, PlayerQueueManager }
