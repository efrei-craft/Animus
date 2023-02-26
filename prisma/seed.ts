import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function loadTemplates() {
  await prisma.template.upsert({
    where: { name: "mini" },
    update: {},
    create: {
      name: "mini",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/mini"
    },
    select: {
      name: true,
      repository: true
    }
  })

  await prisma.template.upsert({
    where: { name: "lobby" },
    update: {},
    create: {
      name: "lobby",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/lobby"
    },
    select: {
      name: true,
      repository: true
    }
  })

  await prisma.template.upsert({
    where: { name: "proxy" },
    update: {},
    create: {
      name: "proxy",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/proxy"
    },
    select: {
      name: true,
      repository: true
    }
  })
}

async function loadServers() {
  await prisma.server.upsert({
    where: { name: "lobby" },
    update: {},
    create: {
      name: "lobby",
      template: {
        connect: {
          name: "lobby"
        }
      }
    }
  })
}

async function main() {
  await loadTemplates()
  await loadServers()
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
