import { Service } from "fastify-decorators"
import {
  CreateGroupBodySchema,
  UpdateGroupBodyParams
} from "../schemas/Permissions.schema"
import prisma from "../../../../clients/Prisma"
import { PermGroup, Permission, Prisma } from "@prisma/client"
import { ApiError } from "../../helpers/Error"

@Service()
export default class PermissionsService {
  /**
   * The select object for public PermGroup data.
   * @private
   */
  private PermGroupPublicSelect: Prisma.PermGroupSelect = {
    id: true,
    name: true,
    prefix: true,
    color: true,
    bold: true,
    permissions: {
      select: {
        name: true
      }
    },
    priority: true,
    defaultGroup: true,
    parentGroupId: true
  }

  async createGroup(group: CreateGroupBodySchema): Promise<Partial<PermGroup>> {
    return prisma.permGroup.create({
      data: {
        ...group
      },
      select: this.PermGroupPublicSelect
    })
  }

  async getGroups(): Promise<Partial<PermGroup>[]> {
    return prisma.permGroup.findMany({
      select: this.PermGroupPublicSelect
    })
  }

  async updateGroup(
    groupId: number,
    body: UpdateGroupBodyParams
  ): Promise<Partial<PermGroup>> {
    const groupData = await prisma.permGroup.findFirst({
      where: { id: groupId }
    })

    if (!groupData) throw new ApiError("Group to update not found", 404)
    if (groupData.defaultGroup) {
      const defaultGroup = await prisma.permGroup.findFirst({
        where: {
          defaultGroup: true,
          id: {
            not: groupId
          }
        }
      })
      if (defaultGroup) {
        if (!body.forceReplace) {
          throw new ApiError(
            `${defaultGroup.name} is already default group`,
            409
          )
        } else {
          await prisma.permGroup.update({
            where: { id: defaultGroup.id },
            data: {
              defaultGroup: false
            }
          })
        }
      }
    }
    if (body.name) {
      const group = await prisma.permGroup.findFirst({
        where: {
          name: body.name,
          id: {
            not: groupId
          }
        }
      })
      if (group)
        throw new ApiError("Other group with this name already exists", 409)
    }

    delete body.forceReplace
    return prisma.permGroup.update({
      where: { id: groupId },
      data: {
        ...body
      },
      select: {
        ...this.PermGroupPublicSelect
      }
    })
  }

  async deleteGroup(groupId: number) {
    return prisma.permGroup.delete({
      where: { id: groupId }
    })
  }

  async addGroupPermissions(
    groupId: number,
    permissions: Array<Partial<Permission>>
  ): Promise<Partial<Permission>[]> {
    const group = await prisma.permGroup.findFirst({
      where: { id: groupId },
      select: {
        id: true,
        permissions: {
          select: {
            name: true
          }
        }
      }
    })

    if (!group) throw new ApiError("group-not-found", 404)

    const existingPermissions = group.permissions.map((p) => p.name)

    const newPermissions = permissions.filter(
      (p) => !existingPermissions.includes(p.name)
    )

    await prisma.permGroup.update({
      where: { id: groupId },
      data: {
        permissions: {
          createMany: {
            data: newPermissions.map((p) => ({
              name: p.name,
              expires: p.expires,
              serverTypes: p.serverTypes
            }))
          }
        }
      }
    })

    return newPermissions
  }

  async removeGroupPermissions(
    groupId: number,
    permissions: string[]
  ): Promise<string[]> {
    const group = await prisma.permGroup.findFirst({
      where: { id: groupId },
      select: {
        id: true,
        permissions: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!group) throw new ApiError("group-not-found", 404)

    const existingPermissions = group.permissions.map((p) => p.name)

    const removePermissions = permissions.filter((permission) =>
      existingPermissions.includes(permission)
    )

    const removePermissionIds = group.permissions
      .filter((perm) => removePermissions.includes(perm.name))
      .map((perm) => perm.id)

    await prisma.permGroup.update({
      where: { id: groupId },
      data: {
        permissions: {
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
}
