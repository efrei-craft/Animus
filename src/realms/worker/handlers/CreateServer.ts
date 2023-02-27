import prisma from "../../../clients/Prisma"
import consolaGlobalInstance from "consola"
import { serverNameGenerator } from "../helpers/ServerNameGenerator"
import docker from "../../../clients/Docker"
import { getNeededVars } from "../helpers/EnvGetter"
import { ApiError } from "../../rest/helpers/Error"

import * as crypto from "crypto"

function getForwardingSecret() {
  return crypto
    .createHash("md5")
    .update(process.env.INFRASTRUCTURE_NAME)
    .digest("hex")
}

export default async (templateName: string) => {
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
    throw new ApiError("template-not-found", 404)
  }

  consolaGlobalInstance.debug(
    `Creating server with the ${templateName} template...`
  )

  const serverName = serverNameGenerator(template.name)

  await docker.createContainer({
    name: serverName,
    Hostname: serverName,
    Image: template.repository,
    HostConfig: {
      NetworkMode: process.env.INFRASTRUCTURE_NAME,
      PortBindings:
        process.env.NODE_ENV === "development" && template.name === "proxy"
          ? {
              "25577/tcp": [
                {
                  HostPort: "25565"
                }
              ]
            }
          : {}
    },
    Env: [
      `TEMPLATE_NAME=${template.name}`,
      `ENV_FORWARDING_SECRET=${getForwardingSecret()}`,
      ...getNeededVars()
    ]
  })

  const container = await docker.getContainer(serverName)
  await container.start()

  const inspection = await container.inspect()

  await prisma.server.create({
    data: {
      name: serverName,
      address:
        inspection.NetworkSettings.Networks[process.env.INFRASTRUCTURE_NAME]
          .IPAddress,
      template: {
        connect: {
          name: template.name
        }
      }
    }
  })

  consolaGlobalInstance.success(`Server ${serverName} created and started`)
}
