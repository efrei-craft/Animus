import { Service } from "fastify-decorators"
import { ApiKey, ApiScope } from "@prisma/client"
import prisma from "../../../clients/Prisma"

@Service()
export default class MiscService {
  async createAPIKey(
    key: string,
    description: string,
    scopes: string[]
  ): Promise<ApiKey> {
    const existing = await prisma.apiKey.findFirst({
      where: {
        key
      }
    })

    if (existing) {
      throw new Error("key-already-exists")
    }

    const existingScopes: ApiScope[] = []
    for (const scope of scopes) {
      if (!Object.values(ApiScope).includes(scope as ApiScope)) {
        throw new Error("invalid-scope")
      }
      existingScopes.push(ApiScope[scope])
    }

    return prisma.apiKey.create({
      data: {
        key,
        description,
        scopes: {
          set: existingScopes
        }
      }
    })
  }
}
