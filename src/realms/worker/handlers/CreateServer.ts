import prisma from "../../../clients/Prisma"
import consolaGlobalInstance from "consola"
import { serverNameGenerator } from "../helpers/ServerNameGenerator"
import docker from "../../../clients/Docker"
import { getNeededVars } from "../helpers/EnvGetter"

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
    throw new Error(`Template ${templateName} does not exist`)
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
      NetworkMode: process.env.INFRASTRUCTURE_NAME
    },
    Env: [
      `SERVER_NAME=${serverName}`,
      `TEMPLATE_NAME=${template.name}`,
      ...getNeededVars()
    ]
  })

  const container = await docker.getContainer(serverName)

  console.log(await container.inspect())
  await container.start()

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

  consolaGlobalInstance.success(`Server ${serverName} created and started`)
}
