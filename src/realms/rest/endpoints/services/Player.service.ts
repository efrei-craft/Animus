import prisma from "../../../../clients/Prisma"
import { ChatChannels, Permission, Player, Prisma } from "@prisma/client"
import { Service } from "fastify-decorators"
import { ApiError } from "../../helpers/Error"
import {
  PlayerCreateBodySchema,
  PlayerMigrateBodySchema
} from "../schemas/Player.schema"
import { AnimusRestServer } from "../.."

@Service()
export default class PlayerService {
  /**
   * The select object for public player data.
   * @private
   */
  public static PlayerPublicSelect: Prisma.PlayerSelect = {
    uuid: true,
    username: true,
    permGroups: {
      select: {
        id: true,
        name: true,
        prefix: true,
        color: true,
        priority: true,
        bold: true
      },
      orderBy: {
        priority: "desc"
      }
    },
    perms: {
      select: {
        name: true,
        serverTypes: true
      }
    },
    serverName: true,
    chatChannel: true,
    lastSeen: true,
    memberDiscordId: true,
    punishments: true
  }

  /**
   * The select object for public permission data.
   */
  public static PermissionPublicSelect: Prisma.PermGroup$permissionsArgs = {
    select: {
      name: true,
      serverTypes: true
    },
    where: {
      OR: [
        {
          expires: {
            gte: new Date()
          }
        },
        {
          expires: null
        }
      ]
    }
  }

  async migratePlayer(
    uuid: string,
    body: PlayerMigrateBodySchema
  ): Promise<Partial<Player>> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        uuid: true
      }
    })

    if (!player) throw new ApiError("player-not-found", 404)

    return prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        uuid: body.uuid,
        username: body.username
      },
      select: PlayerService.PlayerPublicSelect
    })
  }

  async createPlayer(body: PlayerCreateBodySchema): Promise<Partial<Player>> {
    AnimusRestServer.getInstance()
      .getLogger()
      .info("Creating player with payload " + JSON.stringify(body, null, 2))

    const groupsToAssign = await prisma.permGroup.findMany({
      where: {
        name: {
          in: body.permGroups
        }
      },
      select: {
        name: true
      }
    })

    const res = await prisma.member.update({
      where: {
        discordId: body.memberDiscordId
      },
      data: {
        player: {
          create: {
            uuid: body.uuid,
            username: body.username,

            permGroups: {
              connect: groupsToAssign.map((group) => {
                return {
                  name: group.name
                }
              })
            }
          }
        }
      },
      select: {
        player: {
          select: PlayerService.PlayerPublicSelect
        }
      }
    })

    if (!res.player) throw new ApiError("player-creation-failed", 500)

    return res.player
  }

  async fetchAllPlayers(): Promise<Partial<Player>[]> {
    return prisma.player.findMany({
      select: PlayerService.PlayerPublicSelect
    })
  }

  /**
   * Fetches a player from the database, if the player does not exist, it will be created
   * @param uuid The player's UUID
   * @param username The player's username
   * @param createOrUpdate Whether to create or update the player
   * @return A promise that resolves to the fetched player
   */
  async fetchPlayer(
    uuid: string,
    createOrUpdate: boolean,
    username = ""
  ): Promise<Partial<Player>> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: PlayerService.PlayerPublicSelect
    })
    if (createOrUpdate) {
      if (player) {
        if (player.permGroups.length === 0) {
          const defaultGroup = await prisma.permGroup.findFirst({
            where: {
              defaultGroup: true
            },
            select: {
              id: true
            }
          })
          if (defaultGroup) {
            await prisma.player.update({
              where: {
                uuid: uuid
              },
              data: {
                permGroups: {
                  connect: {
                    id: defaultGroup.id
                  }
                },
                lastSeen: new Date(),
                username
              }
            })
          } else {
            throw new ApiError("default-group-not-found", 500)
          }
        } else {
          await prisma.player.update({
            where: {
              uuid: uuid
            },
            data: {
              lastSeen: new Date(),
              username
            }
          })
        }
      } else {
        throw new ApiError("unknown-player", 404)
      }
    }
    return player
  }

  async disconnectPlayer(uuid: string): Promise<Partial<Player>> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: PlayerService.PlayerPublicSelect
    })
    if (player) {
      await prisma.player.update({
        where: {
          uuid: uuid
        },
        data: {
          serverName: null
        }
      })
    }
    return player
  }

  /**
   * Changes the player's server
   * @param uuid The player's UUID
   * @param serverId The server's ID
   */
  async changeServer(uuid: string, serverId: string): Promise<void> {
    try {
      await prisma.player.update({
        where: {
          uuid: uuid
        },
        data: {
          server: {
            update: {
              lastPlayerUpdate: new Date()
            }
          }
        }
      })
    } catch (_) {
      /* empty */
    }

    await prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        serverName: serverId
      }
    })
  }

  /**
   * Gets all permissions for a player
   * @param uuid The player's UUID
   * @return A promise that resolves to an array of permission names
   */
  async getPermissions(uuid: string): Promise<Partial<Permission>[]> {
    const playerPermissions = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        permGroups: {
          select: {
            permissions: {
              ...PlayerService.PermissionPublicSelect
            },
            parentGroup: {
              select: {
                permissions: {
                  ...PlayerService.PermissionPublicSelect
                }
              }
            }
          }
        },
        perms: {
          ...PlayerService.PermissionPublicSelect
        }
      }
    })

    if (!playerPermissions) {
      throw new ApiError("player-not-found", 404)
    }

    return [
      ...playerPermissions.perms,
      ...playerPermissions.permGroups.map((group) => group.permissions).flat(),
      ...playerPermissions.permGroups
        .map((group) => group.parentGroup)
        .filter((group) => group !== null)
        .map((group) => group.permissions)
        .flat()
    ]
  }

  /**
   * Adds permissions to a player
   * @param uuid The player's UUID
   * @param permissions An array of permission names
   * @return A promise that resolves to an array of permission names that were added
   */
  async addPermissions(
    uuid: string,
    permissions: Partial<Permission>[]
  ): Promise<Partial<Permission>[]> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        perms: {
          ...PlayerService.PermissionPublicSelect
        }
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    const existingPermissions = player.perms.map((perm) => perm.name)

    const newPermissions = permissions.filter(
      (permission) => !existingPermissions.includes(permission.name)
    )

    await prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        perms: {
          createMany: {
            data: newPermissions.map((permission) => {
              return {
                name: permission.name,
                expires: permission.expires,
                serverTypes: permission.serverTypes
              }
            })
          }
        }
      }
    })

    return newPermissions
  }

  /**
   * Removes permissions from a player
   * @param uuid The player's UUID
   * @param permissions An array of permission names
   * @return A promise that resolves to an array of permission names that were removed
   */
  async removePermissions(
    uuid: string,
    permissions: string[]
  ): Promise<string[]> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        perms: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    const existingPermissions = player.perms.map((perm) => perm.name)

    const removePermissions = permissions.filter((permission) =>
      existingPermissions.includes(permission)
    )

    const removePermissionIds = player.perms
      .filter((perm) => removePermissions.includes(perm.name))
      .map((perm) => perm.id)

    await prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        perms: {
          deleteMany: {
            id: {
              in: removePermissionIds
            }
          }
        }
      }
    })

    return removePermissions
  }

  async addPermissionGroup(uuid: string, groupName: string): Promise<void> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        permGroups: {
          select: {
            name: true
          }
        }
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    const existingGroups = player.permGroups.map((group) => group.name)

    if (!existingGroups.includes(groupName)) {
      await prisma.player.update({
        where: {
          uuid: uuid
        },
        data: {
          permGroups: {
            connect: {
              name: groupName
            }
          }
        }
      })
    }
  }

  async setPermissionGroups(
    uuid: string,
    groupNames: Array<string>
  ): Promise<void> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        permGroups: {
          select: {
            name: true
          }
        }
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    await prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        permGroups: {
          disconnect: player.permGroups.map((group) => {
            return {
              name: group.name
            }
          })
        }
      }
    })

    await prisma.player.update({
      where: {
        uuid: uuid
      },
      data: {
        permGroups: {
          connect: groupNames.map((groupName) => {
            return {
              name: groupName
            }
          })
        }
      }
    })
  }

  async removePermissionGroup(uuid: string, groupName: string): Promise<void> {
    const player = await prisma.player.findUnique({
      where: {
        uuid: uuid
      },
      select: {
        permGroups: {
          select: {
            name: true
          }
        }
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    const existingGroups = player.permGroups.map((group) => group.name)

    if (existingGroups.includes(groupName)) {
      await prisma.player.update({
        where: {
          uuid: uuid
        },
        data: {
          permGroups: {
            disconnect: {
              name: groupName
            }
          }
        }
      })
    }
  }

  /**
   * Changes a player's chat channel
   * @param uuid The player's UUID
   * @param channel The channel to change to
   */
  async changeChannel(uuid: string, channel: string): Promise<void> {
    if (!ChatChannels[channel]) {
      throw new ApiError("invalid-channel", 400)
    }

    const player = await prisma.player.findUnique({
      where: {
        uuid
      }
    })

    if (!player) {
      throw new ApiError("player-not-found", 404)
    }

    await prisma.player.update({
      where: {
        uuid
      },
      data: {
        chatChannel: ChatChannels[channel]
      }
    })
  }

  /**
   * Gets all online players
   * @return A promise that resolves to an array of online players
   */
  async getOnlinePlayers(): Promise<Partial<Player>[]> {
    return prisma.player.findMany({
      where: {
        serverName: {
          not: null
        }
      },
      select: PlayerService.PlayerPublicSelect
    })
  }
}
