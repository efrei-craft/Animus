import { QueueHandler } from "./index"
import prisma from "../../../clients/Prisma"
import { GameStatus, ServerType } from "@prisma/client"
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
    parentTemplates: Array<{ name: string }>
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
  return server.sort((a, b) => a.players.length - b.players.length)[0]
}

const GamesQueue: QueueHandler = {
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
        templates: {
          select: {
            name: true,
            parentTemplates: {
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
        const template = game.templates.find((template) =>
          template.parentTemplates.find(
            (parent) => parent.name === parentTemplateName
          )
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
        const proxyParent = game.templates
          .find((template) => template.name === templateName)
          ?.parentTemplates.find(
            (parent) => parent.type === ServerType.VELOCITY
          )

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
                await RedisClient.getInstance().publishToPlugin(
                  bestServer.name,
                  "LudosCore",
                  "changeRequestedGame",
                  game.name
                )
              }
            } else {
              const serversCountToDeploy = Math.floor(
                uuids.length / game.maxPlayers
              )
              if (serversCountToDeploy > 0) {
                serversToDeploy.set(templateName, serversCountToDeploy)
              } else if (uuids.length % game.maxPlayers > 0) {
                serversToDeploy.set(templateName, 1)
              }
            }
          } else {
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
        const serversToCreate =
          count -
          servers.filter((server) => server.templateName === templateName)
            .length
        for (let i = 0; i < serversToCreate; i++) {
          console.log("create server")
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
