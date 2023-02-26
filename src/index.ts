import { AnimusRestServer } from "./realms/rest"

import consolaGlobalInstance from "consola"
import "reflect-metadata"
import { AnimusWorker } from "./realms/worker"

consolaGlobalInstance.level = process.env.NODE_ENV === "production" ? 3 : 5

const initRestServer = async () => {
  const server = new AnimusRestServer()

  consolaGlobalInstance.debug(
    `Initializing server on the ${process.env.NODE_ENV} environment...`
  )

  await server.registerServerRoutes()
  await server.start()
}

const initWorkerServer = async () => {
  const server = new AnimusWorker()

  consolaGlobalInstance.debug(
    `Initializing worker on the ${process.env.NODE_ENV} environment...`
  )

  await server.start()
}

if (process.env.SERVER_TYPE === "rest") {
  initRestServer()
    .then(() => {
      consolaGlobalInstance.success(`Rest server started successfully.`)
    })
    .catch((err) => {
      consolaGlobalInstance.error(`Server failed to start: ${err}`)
    })
} else if (process.env.SERVER_TYPE === "worker") {
  initWorkerServer()
    .then(() => {
      consolaGlobalInstance.success(`Worker server started successfully.`)
    })
    .catch((err) => {
      consolaGlobalInstance.error(`Server failed to start: ${err}`)
    })
}
