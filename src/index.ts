import { AnimusRestServer } from "./realms/rest"

import consolaGlobalInstance from "consola"
import "reflect-metadata"
import { AnimusWorker } from "./realms/worker"

consolaGlobalInstance.level = process.env.NODE_ENV === "production" ? 3 : 5

const initRestServer = async () => {
  consolaGlobalInstance.info(
    `Initializing server on the ${process.env.NODE_ENV} environment...`
  )

  const server = AnimusRestServer.getInstance()
  await server.start()
}

const initWorkerServer = async () => {
  consolaGlobalInstance.info(
    `Initializing worker on the ${process.env.NODE_ENV} environment...`
  )

  const server = AnimusWorker.getInstance()
  await server.start()
}

if (process.env.SERVER_TYPE === "rest") {
  initRestServer()
    .then(() => {
      consolaGlobalInstance.success(`Rest server initialized successfully.`)
    })
    .catch((err) => {
      consolaGlobalInstance.error(`Server failed to start: ${err}`)
    })
} else if (process.env.SERVER_TYPE === "worker") {
  initWorkerServer().catch((err) => {
    consolaGlobalInstance.error(`Server failed to start: ${err}`)
  })
}
