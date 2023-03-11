import { QueueHandler } from "./index"
import prisma from "../../../clients/Prisma"
import { GameStatus } from "@prisma/client"
import RedisClient from "../../../clients/Redis"
import { AnimusWorker } from "../index"

type ServerData = {
  name: string
  ready: boolean
  players: Array<{ uuid: string }>
  gameServer: {
    requestedGame: { name: string }
    game: { name: string }
    status: GameStatus
  }
}

type GameData = {
  name: string
  minQueueToStart: number
  maxPlayers: number
  templates: Array<{
    name: string
    parentTemplate: { name: string }
    servers: Array<ServerData>
  }>
}

const dispatchPlayersInServer = async (
  parent: string,
  game: GameData,
  server: ServerData,
  uuids: Array<string>
) => {
  const playersWithMembers = await prisma.player.findMany({
    where: {
      uuid: {
        in: uuids
      }
    },
    select: {
      uuid: true,
      party: {
        select: {
          members: {
            select: {
              uuid: true
            }
          }
        }
      }
    }
  })

  const uuidsMap = new Map<string, Array<string>>()
  for (const player of playersWithMembers) {
    if (player.party) {
      uuidsMap.set(
        player.uuid,
        player.party.members.map((member) => member.uuid)
      )
    } else {
      uuidsMap.set(player.uuid, [player.uuid])
    }
  }

  const sortedUuids = Array.from(uuidsMap.entries()).sort(
    (a, b) => a[1].length - b[1].length
  )

  const dispatchedPlayers: Array<string> = []

  for (const [, partyMembers] of sortedUuids) {
    if (dispatchedPlayers.length >= game.maxPlayers) {
      break
    }
    if (dispatchedPlayers.length + partyMembers.length > game.maxPlayers) {
      break
    }
    dispatchedPlayers.push(...partyMembers.map((uuid) => uuid))
  }

  await RedisClient.getInstance().publishToPlugin(
    parent,
    "Vicarius",
    "sendMessage",
    "QUEUE",
    "&7Un serveur a été &atrouvé&7 ! &7Transfert sur &a" +
      server.name +
      "&7...",
    dispatchedPlayers.join(",")
  )

  await RedisClient.getInstance().publishToPlugin(
    parent,
    "Vicarius",
    "transferPlayers",
    server.name,
    dispatchedPlayers.join(",")
  )

  await RedisClient.getInstance().client.srem(
    `games:queue:${game.name}`,
    ...dispatchedPlayers.map((uuid) => parent + ":" + uuid)
  )
}

const getBestServer = (
  game: GameData,
  templateName: string
): ServerData | null => {
  const template = game.templates.find(
    (template) => template.name === templateName
  )
  const server = template.servers.filter((server) => {
    const gameServer = server.gameServer
    if (!gameServer) {
      return false
    }
    const gameServerGame = gameServer.game
    const gameServerRequestedGame = gameServer.requestedGame

    return (
      server.ready &&
      (gameServerRequestedGame === null ||
        gameServerRequestedGame.name === game.name ||
        (gameServerGame && gameServerGame.name === game.name)) &&
      gameServer.status === GameStatus.WAITING &&
      (gameServerGame || server.players.length < game.maxPlayers)
    )
  })

  if (server.length === 0) {
    return null
  }

  const serverWithGame = server.find((server) => {
    const gameServer = server.gameServer
    if (!gameServer) {
      return false
    }
    const gameServerGame = gameServer.game
    return gameServerGame && gameServerGame.name === game.name
  })

  if (serverWithGame) {
    return serverWithGame
  }

  return server.sort((a, b) => a.players.length - b.players.length)[0]
}

const GamesQueue: Partial<QueueHandler> = {
  pattern: "games:queue:*",
  handle: async (data: Map<string, string[]>): Promise<void> => {
    const keysArray = Array.from(data.keys()).map((key) =>
      key.replace("games:queue:", "")
    )

    const games = await prisma.game.findMany({
      where: {
        name: {
          in: keysArray
        }
      },
      select: {
        name: true,
        minQueueToStart: true,
        maxPlayers: true,
        displayName: true,
        color: true,
        templates: {
          select: {
            name: true,
            minimumServers: true,
            maximumServers: true,
            parentTemplate: {
              select: {
                name: true,
                type: true
              }
            },
            servers: {
              select: {
                name: true,
                ready: true,
                players: {
                  select: {
                    uuid: true
                  }
                },
                gameServer: {
                  select: {
                    game: {
                      select: {
                        name: true
                      }
                    },
                    status: true,
                    requestedGame: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    for (const [key, value] of data) {
      const keyName = key.replace("games:queue:", "")
      const game = games.find((game) => game.name === keyName)

      const serversToDeploy: Map<string, number> = new Map()

      if (!game) {
        continue
      }

      const groupByTemplate: Map<string, string[]> = new Map()
      for (const item of value) {
        const [parentTemplateName, uuid] = item.split(":")
        const template = game.templates.find(
          (template) => template.parentTemplate.name === parentTemplateName
        )
        if (template) {
          if (groupByTemplate.has(template.name)) {
            groupByTemplate.set(template.name, [
              ...groupByTemplate.get(template.name),
              uuid
            ])
          } else {
            groupByTemplate.set(template.name, [uuid])
          }
        }
      }

      for (const [templateName, uuids] of groupByTemplate) {
        const proxyParent = game.templates.find(
          (template) => template.name === templateName
        )?.parentTemplate

        if (!proxyParent) {
          continue
        }

        if (uuids.length === 0) {
          continue
        } else {
          const players = await prisma.player.findMany({
            where: {
              uuid: {
                in: uuids
              }
            },
            select: {
              uuid: true,
              party: {
                select: {
                  members: {
                    select: {
                      uuid: true
                    }
                  }
                }
              }
            }
          })

          const allPlayers = players.map((player) => {
            if (player.party) {
              return [
                ...player.party.members.map((member) => member.uuid),
                player.uuid
              ]
            }
            return player.uuid
          })

          const enoughPlayers = allPlayers.length >= game.minQueueToStart
          const bestServer = getBestServer(game, templateName)
          console.log(game.name, bestServer)

          if (enoughPlayers) {
            if (bestServer !== null) {
              if (
                bestServer.gameServer.game !== null &&
                bestServer.gameServer.game.name === game.name
              ) {
                await dispatchPlayersInServer(
                  proxyParent.name,
                  game,
                  bestServer,
                  uuids
                )
              } else if (
                bestServer.gameServer.requestedGame === null &&
                bestServer.gameServer.game === null
              ) {
                await prisma.gameServer.update({
                  where: {
                    serverName: bestServer.name
                  },
                  data: {
                    requestedGameName: game.name
                  }
                })

                await RedisClient.getInstance().publishToPlugin(
                  bestServer.name,
                  "LudosCore",
                  "changeRequestedGame",
                  game.name
                )
                console.log("changeRequestedGame", bestServer.name, game.name)
              }
            } else {
              const serversCountToDeploy = Math.ceil(
                uuids.length / game.maxPlayers
              )
              if (serversCountToDeploy > 0) {
                serversToDeploy.set(templateName, serversCountToDeploy)
              } else if (uuids.length % game.maxPlayers > 0) {
                serversToDeploy.set(templateName, 1)
              }
            }

            await RedisClient.getInstance().publishToPlugin(
              proxyParent.name,
              "Vicarius",
              "sendActionBar",
              "&bFile d'attente " +
                game.color +
                game.displayName +
                " &r &8• &a" +
                allPlayers.length +
                "&7/" +
                game.minQueueToStart +
                " joueurs &8• &6En attente d'un serveur...",
              allPlayers.join(",")
            )
          } else {
            console.log("bestServer", bestServer)
            if (
              bestServer !== null &&
              bestServer.gameServer.game !== null &&
              bestServer.gameServer.game.name === game.name
            ) {
              console.log("await dispatchPlayersInServer")
              await dispatchPlayersInServer(
                proxyParent.name,
                game,
                bestServer,
                uuids
              )
            } else {
              await RedisClient.getInstance().publishToPlugin(
                proxyParent.name,
                "Vicarius",
                "sendActionBar",
                "&bFile d'attente " +
                  game.color +
                  game.displayName +
                  " &r&8• &c" +
                  allPlayers.length +
                  "&7/" +
                  game.minQueueToStart +
                  " joueurs &8• &eEn attente de joueurs...",
                allPlayers.join(",")
              )
            }
          }
        }
      }

      const servers = await prisma.server.findMany({
        where: {
          templateName: {
            in: Array.from(serversToDeploy.keys())
          },
          gameServer: {
            is: null
          }
        }
      })

      for (const [templateName, count] of serversToDeploy) {
        const template = game.templates.find(
          (template) => template.name === templateName
        )
        const existingServers = servers.filter(
          (server) => server.templateName === templateName
        )

        let serversToCreate = 0

        if (
          template.maximumServers &&
          existingServers.length > template.maximumServers
        ) {
          continue
        }

        if (existingServers.length < count) {
          serversToCreate = count - existingServers.length
        } else if (existingServers.length > count) {
          continue
        }

        for (let i = 0; i < serversToCreate; i++) {
          await AnimusWorker.getInstance().insertIntoQueue(
            "CreateServer",
            templateName
          )
        }
      }
    }

    return
  }
}

export default GamesQueue
