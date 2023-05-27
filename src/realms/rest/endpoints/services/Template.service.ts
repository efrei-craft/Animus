import { Service } from "fastify-decorators"
import prisma from "../../../../clients/Prisma"
import { Prisma } from "@prisma/client"
import { ApiError } from "../../helpers/Error"

@Service()
export default class TemplateService {
  public static TemplatePublicSelect: Prisma.TemplateSelect = {
    name: true,
    repository: true,
    autoremove: true,
    type: true,
    port: true,

    minimumServers: true,
    maximumServers: true,

    parentTemplateName: true,
    static: true,
    storageMode: true,

    motd: true,

    permissionToJoin: true
  }

  async setMOTD(motd: string) {
    return prisma.template.update({
      where: {
        name: "proxy"
      },
      data: {
        motd
      },
      select: TemplateService.TemplatePublicSelect
    })
  }

  async fetchTemplate(name: string) {
    const fetched = await prisma.template.findFirst({
      where: {
        name
      },
      select: TemplateService.TemplatePublicSelect
    })

    if (!fetched) throw new ApiError("not-found", 404)

    return fetched
  }

  async fetchTemplates() {
    return (await prisma.template.findMany()) || []
  }
}
