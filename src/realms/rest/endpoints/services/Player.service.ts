import prisma from "../../../../clients/Prisma"
import { ChatChannels, Permission, Player, Prisma } from "@prisma/client"
import { Service } from "fastify-decorators"
import { ApiError } from "../../helpers/Error"
import { PlayerCreateBodySchema } from "../schemas/Player.schema"

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

  async createPlayer(body: PlayerCreateBodySchema): Promise<Partial<Player>> {
    return prisma.player.create({
      data: {
        ...body,
      }
    })
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
    try {
      const player = await prisma.player.findUnique({
        where: {
          uuid: uuid
        },
        select: PlayerService.PlayerPublicSelect
      })
      if (createOrUpdate) {
        if (player) {
          await prisma.player.update({
            where: {
              uuid: uuid
            },
            data: {
              lastSeen: new Date(),
              username
            }
          })
        } else {
          return this.createPlayer(uuid, username)
        }
      }
      return player
    } catch (e) {
      throw new ApiError("player-fetch-failed", 500)
    }
  }

  async disconnectPlayer(uuid: string): Promise<Partial<Player>> {
    try {
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
    } catch (e) {
      throw new ApiError("player-fetch-failed", 500)
    }
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

    const permissions: Permission[] = []

    playerPermissions.permGroups.forEach((group) => {
      group.permissions.forEach((permission) => {
        permissions.push(permission)
      })
      if (group.parentGroup) {
        group.parentGroup.permissions.forEach((permission) => {
          permissions.push(permission)
        })
      }
    })

    playerPermissions.perms.forEach((permission) => {
      permissions.push(permission)
    })

    return permissions
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

    console.log(player)

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

    console.log(newPermissions)

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

  async setPermissionGroup(uuid: string, groupName: string): Promise<void> {
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
          }),
          connect: {
            name: groupName
          }
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
   * Creates a new player
   * @param uuid The player's UUID
   * @param username The player's username
   * @return A promise that resolves to the created player
   */
  private async createPlayer(
    uuid: string,
    username: string
  ): Promise<Partial<Player>> {
    const defaultGroups = await prisma.permGroup.findMany({
      where: {
        defaultGroup: true
      },
      select: {
        name: true
      }
    })

    return prisma.player.create({
      data: {
        uuid,
        username,
        permGroups: {
          connect: defaultGroups.map((group) => {
            return {
              name: group.name
            }
          })
        }
      },
      select: PlayerService.PlayerPublicSelect
    })
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
