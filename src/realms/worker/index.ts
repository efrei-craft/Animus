import RedisClient from "../../clients/Redis"
import consolaGlobalInstance, { Consola } from "consola"
import { resolve } from "path"
import * as fs from "fs"
import docker from "../../clients/Docker"
import { WorkerMethod } from "./types"
import { PlayerQueueManager } from "./player-queues"
import GameServerWatcher from "./watchers/GameServerWatcher"
import prisma from "../../clients/Prisma"

export class AnimusWorker {
  private logger: Consola

  private static worker: AnimusWorker

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private workerMethods: WorkerMethod[] = []

  private workerRegistered = false

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
          exec: async (arg: string[]) => await handlerContent.exec(arg),
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
    const args = arg.split(":")
    try {
      await method.exec(args)
      this.getLogger().success(`Executed ${method.meta.name} with ${args}`)
    } catch (err) {
      await this.insertIntoQueue(method.meta.name, args.join(":"))
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

  public async insertIntoQueue(methodName: string, ...arg: string[]) {
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
      await RedisClient.getInstance().client.rpush(
        `queue:${methodName}`,
        arg.join(":")
      )
    } else if (method.meta.queueType === "set") {
      await RedisClient.getInstance().client.sadd(
        `queue:${methodName}`,
        arg.join(":")
      )
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
          if (event.Actor.Attributes["animus.server"] === "true") {
            const statusMethods =
              AnimusWorker.getInstance().workerMethods.filter((method) =>
                method.meta?.hooks?.docker.some((hook) => hook === event.status)
              )

            if (statusMethods.length > 0) {
              AnimusWorker.getInstance()
                .getLogger()
                .debug(
                  `Docker Event from ${event.Actor.Attributes.name}: ${event.status}`
                )
            }

            for (const method of statusMethods) {
              AnimusWorker.getInstance().insertIntoQueue(
                method.meta.name,
                event.Actor.Attributes.name
              )
            }
          }
        })
      }
    })
  }

  private async cleanUpServers() {
    await this.cleanUpDeadContainers()
    await this.cleanUpDeadServers()
  }

  private async cleanUpDeadContainers() {
    AnimusWorker.getInstance()
      .getLogger()
      .info("Cleaning up dead containers...")

    const containers = await docker.listContainers({
      all: true,
      filters: {
        status: ["exited"],
        label: ["animus.server=true"]
      }
    })

    const deadContainers = containers.map((container) =>
      container.Names[0].slice(1)
    )

    const servers = await prisma.server.findMany({
      where: {
        name: {
          in: deadContainers
        }
      },
      select: {
        name: true
      }
    })

    for (const server of servers) {
      try {
        await prisma.server.delete({
          where: {
            name: server.name
          }
        })
      } catch (err) {
        AnimusWorker.getInstance()
          .getLogger()
          .error(`Failed to delete server ${server.name}: ${err}`)
      }
    }

    for (const container of deadContainers) {
      try {
        await docker.getContainer(container).remove()
      } catch (err) {
        AnimusWorker.getInstance()
          .getLogger()
          .error(`Failed to delete container ${container}: ${err}`)
      }
    }

    AnimusWorker.getInstance()
      .getLogger()
      .success(`Cleaned up ${servers.length} dead containers`)
  }

  private async cleanUpDeadServers() {
    AnimusWorker.getInstance().getLogger().info("Cleaning up dead servers...")

    const servers = await prisma.server.findMany({
      select: {
        name: true
      }
    })

    const containers = await docker.listContainers({
      all: true,
      filters: {
        label: ["animus.server=true"]
      }
    })

    const runningContainers = containers.map((container) =>
      container.Names[0].slice(1)
    )

    const deadServers = servers.filter(
      (server) => !runningContainers.includes(server.name)
    )

    for (const server of deadServers) {
      try {
        await prisma.server.delete({
          where: {
            name: server.name
          }
        })
      } catch (err) {
        AnimusWorker.getInstance()
          .getLogger()
          .error(`Failed to delete server ${server.name}: ${err}`)
      }
    }

    AnimusWorker.getInstance()
      .getLogger()
      .success(`Cleaned up ${deadServers.length} dead servers`)
  }

  private async initPlayerQueues() {
    const playerQueueHandler = new PlayerQueueManager()
    await playerQueueHandler.initHandlers()
    await playerQueueHandler.intervalQueueHandler()
  }

  private async initWatching() {
    const watcher = new GameServerWatcher()
    await watcher.watch()
  }

  public async start() {
    if (this.workerRegistered) {
      throw new Error("Worker already registered")
    }

    await this.cleanUpServers()

    await this.initDockerEvents()
    await this.registerWorkerMethods()

    this.getLogger().ready(`Worker now listening for Redis queue events...`)

    await this.initWatching()

    await this.initPlayerQueues()

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
