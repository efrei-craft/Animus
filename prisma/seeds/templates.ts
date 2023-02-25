import { PrismaClient, Template } from "@prisma/client"

const prisma = new PrismaClient()

async function loadTemplates() {
  const templates: Template[] = []

  templates.push(
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
  )

  templates.push(
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
  )

  templates.push(
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
  )

  return templates
}

async function main() {
  const mini = await prisma.template.upsert({
    where: { name: "Mini" },
    update: {},
    create: {
      name: "mini",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/mini"
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })

  .catch(async (e) => {
    console.error(e)

    await prisma.$disconnect()

    process.exit(1)
  })
