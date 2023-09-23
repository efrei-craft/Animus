import prisma from "../../../clients/Prisma"
import { serverNameGenerator } from "../helpers/ServerNameGenerator"
import docker, { dockerAuth } from "../../../clients/Docker"
import { getNeededVars } from "../helpers/EnvGetter"

import * as crypto from "crypto"
import { WorkerMethod } from "../types"
import { AnimusWorker } from "../index"
import { ServerType, StorageMode } from "@prisma/client"
import Dockerode from "dockerode"
import { emitMessage } from "../../rest/emitter"

function getForwardingSecret() {
  return crypto
    .createHash("md5")
    .update(process.env.INFRASTRUCTURE_NAME)
    .digest("hex")
}

export const method: WorkerMethod = {
  exec: async ([templateName, permanent]) => {
    const template = await prisma.template.findUnique({
      where: {
        name: templateName
      },
      select: {
        name: true,
        repository: true,
        storageMode: true,
        extraBinds: true,
        port: true,
        type: true,
        maximumServers: true,
        static: true,
        _count: {
          select: {
            servers: true
          }
        }
      }
    })

    if (!template) {
      emitMessage("serverStateError", {
        message: `Le template ${templateName} n'existe pas.`
      })
      AnimusWorker.getInstance()
        .getLogger()
        .error(`Template ${templateName} does not exist.`)
      return
    }

    if (
      template.maximumServers &&
      template._count.servers >= template.maximumServers
    ) {
      emitMessage("serverStateError", {
        message: `Le template ${template.name} a atteint son nombre maximum de serveurs.`
      })
      AnimusWorker.getInstance()
        .getLogger()
        .warn(`Template ${template.name} has reached its maximum server count.`)
      return
    }

    AnimusWorker.getInstance()
      .getLogger()
      .info(
        `Creating server with the ${template.name} template (permanent: ${
          permanent === "true"
        })...`
      )

    let serverName = serverNameGenerator(template.name)

    if (template.static) {
      const server = await prisma.server.findFirst({
        where: {
          template: {
            name: template.name
          }
        }
      })
      AnimusWorker.getInstance()
        .getLogger()
        .info(
          `Supposedly existing container ${docker.getContainer(serverName)} `
        )
      if (server && docker.getContainer(serverName)) {
        AnimusWorker.getInstance()
          .getLogger()
          .warn(`Server ${server.name} already exists.`)
        return
      }

      const infrastructure = process.env.INFRASTRUCTURE_NAME
      serverName = `${infrastructure}.${template.name}`
    }

    await prisma.server.create({
      data: {
        name: serverName,
        template: {
          connect: {
            name: template.name
          }
        },
        permanent: template.static ? true : permanent === "true"
      }
    })

    const containerInfo: Dockerode.ContainerCreateOptions = {
      name: serverName,
      Hostname: serverName,
      Image: template.repository,
      Tty: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
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
        `INFRASTRUCTURE_NAME=${process.env.INFRASTRUCTURE_NAME}`,
        ...getNeededVars()
      ]
    }

    if (template.static) {
      if (template.storageMode === StorageMode.HOST) {
        containerInfo.HostConfig.Binds = [
          `${process.env.STORAGE_PATH}/${serverName}:/data:rw`,
          `/data/plugins`,
          `/data/libraries`,
          ...template.extraBinds.map(
            (bind) =>
              `${process.env.STORAGE_PATH}/${serverName}/${bind}:/data/${bind}:rw`
          )
        ]
      } else if (template.storageMode === StorageMode.VOLUME) {
        const volumes = await docker.listVolumes()
        const volume = volumes.Volumes.find(
          (volume) => volume.Name === serverName
        )

        if (!volume) {
          await docker.createVolume({
            Name: serverName
          })
        }

        containerInfo.HostConfig.Binds = [`${serverName}:/data:rw`]
      }
    }

    emitMessage("serverStateInfo", {
      server: serverName,
      message: `Récupération de l'image et création du serveur...`
    })

    await new Promise((resolve) => {
      docker.pull(
        template.repository,
        {},
        (err, res) => {
          if (err) {
            AnimusWorker.getInstance()
              .getLogger()
              .debug(`Error while pulling image ${template.repository}: ${err}`)
            resolve(void 0)
            return
          }

          docker.modem.followProgress(res, resolve)
        },
        dockerAuth
      )
    })
    await docker.createContainer(containerInfo)

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

    emitMessage("serverStateInfo", {
      server: serverName,
      message: `Serveur créé. Démarrage du serveur...`
    })

    AnimusWorker.getInstance()
      .getLogger()
      .success(
        `Created and started server ${serverName} (ip: ${
          inspection.NetworkSettings.Networks[process.env.INFRASTRUCTURE_NAME]
            .IPAddress
        })`
      )

    emitMessage("serversChanged", null)
  },
  meta: {
    queueType: "set"
  }
}
