import prisma from "../../../clients/Prisma"
import { serverNameGenerator } from "../helpers/ServerNameGenerator"
import docker from "../../../clients/Docker"
import { getNeededVars } from "../helpers/EnvGetter"

import * as crypto from "crypto"
import { WorkerMethod } from "../types"
import { AnimusWorker } from "../index"
import { ServerType } from "@prisma/client"

function getForwardingSecret() {
  return crypto
    .createHash("md5")
    .update(process.env.INFRASTRUCTURE_NAME)
    .digest("hex")
}

export const method: WorkerMethod = {
  exec: async (templateName: string) => {
    const template = await prisma.template.findUnique({
      where: {
        name: templateName
      },
      select: {
        name: true,
        repository: true,
        port: true,
        type: true
      }
    })

    if (!template) {
      throw new Error("Template not found")
    }

    AnimusWorker.getInstance()
      .getLogger()
      .info(`Creating server with the ${template.name} template...`)

    const serverName = serverNameGenerator(template.name)

    const containerLabels = {
      "animus.server": "true",
      "animus.server.name": serverName,
      "animus.server.template": template.name,
      "traefik.enable": "true"
    }

    containerLabels[
      `traefik.tcp.routers.${serverName}.rule`
    ] = `Host(\`efreicraft.fr\`)`
    containerLabels[
      `traefik.tcp.routers.${serverName}.entrypoints`
    ] = `minecraft`

    await docker.createContainer({
      name: serverName,
      Hostname: serverName,
      Image: template.repository,
      HostConfig: {
        NetworkMode: process.env.INFRASTRUCTURE_NAME,
        PortBindings:
          template.type === ServerType.VELOCITY &&
          process.env.NODE_ENV === "development"
            ? {
                "25577/tcp": [
                  {
                    HostPort: template.port.toString()
                  }
                ]
              }
            : {}
      },
      Labels: containerLabels,
      Env: [
        `TEMPLATE_NAME=${template.name}`,
        `ENV_FORWARDING_SECRET=${getForwardingSecret()}`,
        ...getNeededVars()
      ]
    })

    if (template.type === ServerType.VELOCITY) {
      const traefikNetwork = await docker.getNetwork("traefik_public")
      await traefikNetwork.connect({
        Container: serverName
      })
    }

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

    AnimusWorker.getInstance()
      .getLogger()
      .success(
        `Created and started server ${serverName} (ip: ${
          inspection.NetworkSettings.Networks[process.env.INFRASTRUCTURE_NAME]
            .IPAddress
        })`
      )
  },
  meta: {
    queueType: "list"
  }
}
