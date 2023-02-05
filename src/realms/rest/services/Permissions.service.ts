import { Service } from "fastify-decorators"
import { CreateGroupBodySchema } from "../controllers/schemas/Permissions.schema"
import prisma from "../../../clients/Prisma"
import { PermGroup, Prisma } from "@prisma/client"

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
}
