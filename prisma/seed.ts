import { PrismaClient, ServerType } from "@prisma/client"

const prisma = new PrismaClient()

async function loadTemplates() {
  await prisma.template.upsert({
    where: { name: "proxy" },
    update: {},
    create: {
      name: "proxy",
      repository: "registry.efreicraft.fr/templates/proxy",
      type: ServerType.VELOCITY,
      autoremove: true,
      minimumServers: 0,
      maximumServers: 0
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
      repository: "registry.efreicraft.fr/templates/proxy.dev",
      type: ServerType.VELOCITY,
      port: 25566,
      minimumServers: 1,
      maximumServers: 1
    }
  })

  await prisma.template.upsert({
    where: { name: "mini" },
    update: {},
    create: {
      name: "mini",
      repository: "registry.efreicraft.fr/templates/mini",
      type: ServerType.PAPER,
      autoremove: true,
      parentTemplateName: "proxy"
    }
  })

  await prisma.template.upsert({
    where: { name: "mini.dev" },
    update: {},
    create: {
      name: "mini.dev",
      repository: "registry.efreicraft.fr/templates/mini.dev",
      type: ServerType.PAPER,
      parentTemplateName: "proxy.dev"
    }
  })

  await prisma.template.upsert({
    where: { name: "lobby.dev" },
    update: {},
    create: {
      name: "lobby.dev",
      repository: "registry.efreicraft.fr/templates/lobby.dev",
      type: ServerType.PAPER,
      parentTemplateName: "proxy.dev",
      minimumServers: 1
    }
  })

  await prisma.template.upsert({
    where: { name: "lobby" },
    update: {},
    create: {
      name: "lobby",
      repository: "registry.efreicraft.fr/templates/lobby",
      type: ServerType.PAPER,
      autoremove: true,
      parentTemplateName: "proxy",
      minimumServers: 0
    }
  })
}

async function loadGames() {
  await prisma.game.upsert({
    where: { name: "LudosArena" },
    update: {},
    create: {
      name: "LudosArena",
      maxPlayers: 8,
      color: "&c",
      available: true,
      displayName: "Arena",
      menuDescription:
        "&7L'équipe avec le plus de &ckills&7 à la\\n&7fin du timer gagne !",
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
    where: { name: "LudosBlockParty" },
    update: {},
    create: {
      name: "LudosBlockParty",
      maxPlayers: 10,
      minQueueToStart: 2,
      color: "&b",
      available: false,
      displayName: "Block Party",
      menuDescription:
        "Tenez-vous sur la bonne couleur au bon moment, sinon vous mourrez !",
      menuMaterial: "WHITE_WOOL",
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
    where: { name: "LudosRush" },
    update: {},
    create: {
      name: "LudosRush",
      maxPlayers: 16,
      minQueueToStart: 2,
      menuOrder: 0,
      color: "&5",
      available: true,
      displayName: "Rush",
      menuDescription:
        "&7Détruisez le &5lit&7 de l'équipe adversaire,\\n&7puis tuez-les pour remporter la victoire !",
      menuMaterial: "PURPLE_BED",
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
    where: { name: "LudosSumo" },
    update: {},
    create: {
      name: "LudosSumo",
      maxPlayers: 2,
      minQueueToStart: 2,
      menuOrder: 3,
      color: "&4",
      available: true,
      displayName: "Sumo",
      menuDescription:
        "&7Poussez votre adversaire en dehors\\n&7du &4ring&7 pour gagner !",
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
    where: { name: "Visiteur" },
    update: {},
    create: {
      name: "Visiteur",
      prefix: "&7",
      color: "&7",
      priority: 0,
      defaultGroup: true
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Membre" },
    update: {},
    create: {
      name: "Membre",
      prefix: "&f&lMembre ",
      color: "&f",
      priority: 1
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "WEI" },
    update: {},
    create: {
      name: "WEI",
      prefix: "&6&lWEI ",
      color: "&6",
      priority: 1
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Beta Tester" },
    update: {},
    create: {
      name: "Beta Tester",
      prefix: "&1&lBeta Tester ",
      color: "&1",
      priority: 2
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Designer" },
    update: {},
    create: {
      name: "Designer",
      prefix: "&e&lDesigner ",
      color: "&e",
      priority: 3
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Développeur" },
    update: {},
    create: {
      name: "Développeur",
      prefix: "&5&lDéveloppeur ",
      color: "&5",
      priority: 4
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "1Panthéon" },
    update: {},
    create: {
      name: "1Panthéon",
      prefix: "&9&lResp. 1P ",
      color: "&9",
      priority: 5
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Builder" },
    update: {},
    create: {
      name: "Builder",
      prefix: "&a&lBuilder ",
      color: "&a",
      priority: 6
    }
  })

  const be = await prisma.permGroup.upsert({
    where: { name: "Bureau étendu" },
    update: {},
    create: {
      name: "Bureau étendu",
      prefix: "&c&l",
      color: "&c",
      priority: 7
    },
    select: {
      id: true
    }
  })

  const br = await prisma.permGroup.upsert({
    where: { name: "Bureau restreint" },
    update: {},
    create: {
      name: "Bureau restreint",
      prefix: "&4&l",
      color: "&4",
      priority: 8
    },
    select: {
      id: true
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Resp. Dev" },
    update: {},
    create: {
      name: "Resp. Dev",
      prefix: "&c&lResp. Dev ",
      color: "&c",
      priority: 9,
      parentGroupId: be.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Resp. Design" },
    update: {},
    create: {
      name: "Resp. Design",
      prefix: "&c&lResp. Design ",
      color: "&c",
      priority: 10,
      parentGroupId: be.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Resp. Build" },
    update: {},
    create: {
      name: "Resp. Build",
      prefix: "&c&lResp. Build ",
      color: "&c",
      priority: 11,
      parentGroupId: be.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Secrétaire" },
    update: {},
    create: {
      name: "Secrétaire",
      prefix: "&4&lSecrétaire ",
      color: "&4",
      priority: 12,
      parentGroupId: br.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Trésorier" },
    update: {},
    create: {
      name: "Trésorier",
      prefix: "&4&lTrésorier ",
      color: "&4",
      priority: 13,
      parentGroupId: br.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Vice-Président" },
    update: {},
    create: {
      name: "Vice-Président",
      prefix: "&4&lVice-Président ",
      color: "&4",
      priority: 14,
      parentGroupId: br.id
    }
  })

  await prisma.permGroup.upsert({
    where: { name: "Président" },
    update: {},
    create: {
      name: "Président",
      prefix: "&4&lPrésident ",
      color: "&4",
      priority: 15,
      parentGroupId: br.id
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
