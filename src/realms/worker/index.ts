import RedisClient from "../../clients/Redis"
import consolaGlobalInstance, { Consola } from "consola"
import { resolve } from "path"
import * as fs from "fs"
import docker from "../../clients/Docker"
import { WorkerMethod } from "./types"

export class AnimusWorker {
  private logger: Consola

  private static worker: AnimusWorker

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  workerMethods: WorkerMethod[] = []

  workerRegistered = false

  private async registerWorkerMethods() {
    this.workerRegistered = true
    this.getLogger().info("Registering worker methods...")
    const handlers = await fs.promises.readdir(resolve(__dirname, "handlers"))
    for (const handler of handlers) {
      const handlerName = handler.split(".")[0]
      const handlerContent: WorkerMethod = (
        await import(`./handlers/${handler}`)
      ).method
      this.workerMethods = [
        ...this.workerMethods,
        {
          exec: async (arg: string) => await handlerContent.exec(arg),
          meta: {
            name: handlerName,
            ...handlerContent.meta
          }
        }
      ]
      this.getLogger().debug(`Registered ${handlerName} worker method`)
    }
    this.getLogger().success(
      `Registered ${this.workerMethods.length} worker methods`
    )
  }

  private async executeQueuedMethod(method: WorkerMethod, arg: string) {
    try {
      await method.exec(arg)
      this.getLogger().success(`Executed ${method.meta.name} with ${arg}`)
    } catch (err) {
      await this.insertIntoQueue(method.meta.name, arg)
      this.getLogger().error(
        `Failed to execute ${method.meta.name} with ${arg}: `,
        err
      )
    }
  }

  private async handleQueues() {
    for (const workerMethod of this.workerMethods) {
      const queueName = `queue:${workerMethod.meta.name}`

      const queueType = await RedisClient.getInstance().client.type(queueName)

      if (queueType === "list") {
        const queue = await RedisClient.getInstance().client.lpop(queueName)

        if (queue) {
          await this.executeQueuedMethod(workerMethod, queue)
        }
      } else if (queueType === "set") {
        const queue = await RedisClient.getInstance().client.spop(queueName)

        if (queue) {
          await this.executeQueuedMethod(workerMethod, queue)
        }
      }
    }
  }

  public async insertIntoQueue(methodName: string, arg: string) {
    if (!this.workerRegistered) {
      await this.registerWorkerMethods()
    }

    const method = this.workerMethods.find(
      (workerMethod) => workerMethod.meta.name === methodName
    )

    if (!method) {
      throw new Error(`Method ${methodName} does not exist`)
    }

    if (method.meta.queueType === "list") {
      await RedisClient.getInstance().client.rpush(`queue:${methodName}`, arg)
    } else if (method.meta.queueType === "set") {
      await RedisClient.getInstance().client.sadd(`queue:${methodName}`, arg)
    }
  }

  private async initDockerEvents() {
    docker.getEvents({}, function (err, data) {
      if (err) {
        AnimusWorker.getInstance()
          .getLogger()
          .error(`Error getting docker events: ${err}`)
      } else {
        data.on("data", function (chunk) {
          const event = JSON.parse(chunk.toString())
          if (event.status === "die") {
            AnimusWorker.getInstance()
              .getLogger()
              .info(`Server ${event.id} died`)
            AnimusWorker.getInstance().insertIntoQueue(
              "ServerDied",
              event.Actor.Attributes.name
            )
          }
        })
      }
    })
  }

  public async start() {
    if (this.workerRegistered) {
      throw new Error("Worker already registered")
    }

    await this.initDockerEvents()
    await this.registerWorkerMethods()
    this.getLogger().ready(`Worker now listening for Redis queue events...`)

    while (true) {
      await this.handleQueues()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  public getLogger(): Consola {
    if (!this.logger) {
      this.logger = consolaGlobalInstance.withTag("Worker")
    }
    return this.logger
  }

  static getInstance() {
    if (!AnimusWorker.worker) {
      AnimusWorker.worker = new AnimusWorker()
    }
    return AnimusWorker.worker
  }
}
