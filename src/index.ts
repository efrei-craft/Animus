import { AnimusRestServer } from "./realms/rest"
import consolaGlobalInstance from "consola"

import "reflect-metadata"

const server = new AnimusRestServer()

const initServer = async () => {
  consolaGlobalInstance.level = process.env.NODE_ENV === "production" ? 2 : 5
  consolaGlobalInstance.debug(
    `Initializing server on the ${process.env.NODE_ENV} environment...`
  )

  await server.registerServerRoutes()
  await server.start()
}

initServer()
  .then(() => {
    consolaGlobalInstance.success(`Server started successfully.`)
  })
  .catch((err) => {
    consolaGlobalInstance.error(`Server failed to start: ${err}`)
  })
