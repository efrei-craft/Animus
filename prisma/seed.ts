import { PrismaClient, ServerType } from "@prisma/client"

const prisma = new PrismaClient()

async function loadTemplates() {
  await prisma.template.upsert({
    where: { name: "proxy" },
    update: {},
    create: {
      name: "proxy",
      repository: "docker.nexus.jiveoff.fr/efrei-craft/templates/proxy",
      type: ServerType.VELOCITY,
      autoremove: true
    },
    select: {
      name: true,
      repository: true
    }
  })

  await prisma.template.upsert({
    where: { name: "proxy.dev" },
    update: {},
    create: {
      name: "proxy.dev",
      repository: "dev.efrei-craft/acv/templates/proxy",
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
      autoremove: true,
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
    where: { name: "mini.dev" },
    update: {},
    create: {
      name: "mini.dev",
      repository: "dev.efrei-craft/acp/templates/mini",
      type: ServerType.PAPER,
      parentTemplates: {
        connect: [
          {
            name: "proxy.dev"
          }
        ]
      }
    }
  })

  await prisma.template.upsert({
    where: { name: "lobby.dev" },
    update: {},
    create: {
      name: "lobby.dev",
      repository: "dev.efrei-craft/acp/templates/lobby",
      type: ServerType.PAPER,
      parentTemplates: {
        connect: [
          {
            name: "proxy.dev"
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
      autoremove: true,
      parentTemplates: {
        connect: [
          {
            name: "proxy"
          },
          {
            name: "proxy.dev"
          }
        ]
      }
    }
  })
}

async function loadGames() {
  await prisma.game.upsert({
    where: { name: "Arena" },
    update: {},
    create: {
      name: "Arena",
      maxPlayers: 8,
      color: "&c",
      available: true,
      menuDescription:
        "L'équipe avec le plus de kills à la fin du timer gagne !",
      menuMaterial: "IRON_SWORD",
      menuOrder: 1,
      minQueueToStart: 2,
      permissionToPlay: "efrei-craft.play.arena",
      templates: {
        connect: [
          {
            name: "mini"
          },
          {
            name: "mini.dev"
          }
        ]
      }
    }
  })

  await prisma.game.upsert({
    where: { name: "BlockParty" },
    update: {},
    create: {
      name: "BlockParty",
      maxPlayers: 10,
      minQueueToStart: 2,
      color: "&b",
      available: true,
      menuDescription:
        "Tenez-vous sur la bonne couleur au bon moment, sinon vous mourrez !",
      menuMaterial: "WOOL",
      menuOrder: 2,
      permissionToPlay: "efrei-craft.play.blockparty",
      templates: {
        connect: [
          {
            name: "mini"
          },
          {
            name: "mini.dev"
          }
        ]
      }
    }
  })

  await prisma.game.upsert({
    where: { name: "Rush" },
    update: {},
    create: {
      name: "Rush",
      maxPlayers: 16,
      minQueueToStart: 2,
      menuOrder: 0,
      color: "&5",
      available: true,
      menuDescription:
        "Détruisez le lit de l'équipe adversaire, puis tuez-les pour remporter la victoire !",
      menuMaterial: "BED",
      permissionToPlay: "efrei-craft.play.rush",
      templates: {
        connect: [
          {
            name: "mini"
          },
          {
            name: "mini.dev"
          }
        ]
      }
    }
  })

  await prisma.game.upsert({
    where: { name: "Sumo" },
    update: {},
    create: {
      name: "Sumo",
      maxPlayers: 2,
      minQueueToStart: 2,
      menuOrder: 3,
      color: "&4",
      available: true,
      menuDescription:
        "Poussez votre adversaire en dehors du ring pour gagner !",
      menuMaterial: "STICK",
      permissionToPlay: "efrei-craft.play.sumo",
      templates: {
        connect: [
          {
            name: "mini"
          },
          {
            name: "mini.dev"
          }
        ]
      }
    }
  })
}

async function loadGroups() {
  await prisma.permGroup.upsert({
    where: { name: "default" },
    update: {},
    create: {
      name: "Joueur",
      prefix: "&7",
      color: "&7",
      priority: 0,
      defaultGroup: true,
      permissions: {
        create: [
          {
            name: "efrei-craft.play.*"
          }
        ]
      }
    }
  })
}

async function main() {
  await loadTemplates()
  await loadGames()
  await loadGroups()
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
