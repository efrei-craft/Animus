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
        type: true,
        maximumServers: true,
        _count: {
          select: {
            servers: true
          }
        }
      }
    })

    if (!template) {
      AnimusWorker.getInstance()
        .getLogger()
        .error(`Template ${templateName} does not exist.`)
      return
    }

    if (
      template.maximumServers &&
      template._count.servers >= template.maximumServers
    ) {
      AnimusWorker.getInstance()
        .getLogger()
        .warn(`Template ${template.name} has reached its maximum server count.`)
      return
    }

    AnimusWorker.getInstance()
      .getLogger()
      .info(`Creating server with the ${template.name} template...`)

    const serverName = serverNameGenerator(template.name)

    await prisma.server.create({
      data: {
        name: serverName,
        template: {
          connect: {
            name: template.name
          }
        }
      }
    })

    await docker.createContainer({
      name: serverName,
      Hostname: serverName,
      Image: template.repository,
      Tty: true,
      HostConfig: {
        NetworkMode: process.env.INFRASTRUCTURE_NAME,
        PortBindings:
          template.type === ServerType.VELOCITY
            ? {
                "25577/tcp": [
                  {
                    HostPort: template.port.toString()
                  }
                ]
              }
            : {}
      },
      Labels: {
        "animus.server": "true",
        "animus.server.name": serverName,
        "animus.server.template": template.name
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

    await prisma.server.update({
      where: {
        name: serverName
      },
      data: {
        address:
          inspection.NetworkSettings.Networks[process.env.INFRASTRUCTURE_NAME]
            .IPAddress
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
    queueType: "set"
  }
}
