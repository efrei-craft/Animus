import { PrismaClient, ServerType } from "@prisma/client"

const prisma = new PrismaClient()

async function loadTemplates() {
  await prisma.template.upsert({
    where: { name: "proxy" },
    update: {},
    create: {
      name: "proxy",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/proxy",
      type: ServerType.VELOCITY
    },
    select: {
      name: true,
      repository: true
    }
  })

  await prisma.template.upsert({
    where: { name: "proxy.events" },
    update: {},
    create: {
      name: "proxy.events",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/proxy",
      type: ServerType.VELOCITY,
      port: 25566
    }
  })

  await prisma.template.upsert({
    where: { name: "mini" },
    update: {},
    create: {
      name: "mini",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/mini",
      type: ServerType.PAPER,
      parentTemplates: {
        connect: [
          {
            name: "proxy"
          }
        ]
      }
    }
  })

  await prisma.template.upsert({
    where: { name: "mini.events" },
    update: {},
    create: {
      name: "mini.events",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/mini",
      type: ServerType.PAPER,
      parentTemplates: {
        connect: [
          {
            name: "proxy.events"
          }
        ]
      }
    }
  })

  await prisma.template.upsert({
    where: { name: "lobby" },
    update: {},
    create: {
      name: "lobby",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/lobby",
      type: ServerType.PAPER,
      parentTemplates: {
        connect: [
          {
            name: "proxy"
          },
          {
            name: "proxy.events"
          }
        ]
      }
    }
  })
}

async function main() {
  await loadTemplates()
}

main()
  .then(async () => {
    await prisma.$disconnect()

    console.log("Done.")
  })

  .catch(async (e) => {
    console.error(e)

    await prisma.$disconnect()

    process.exit(1)
  })
