import { Service } from "fastify-decorators"
import { ApiKey, ApiScope } from "@prisma/client"
import prisma from "../../../clients/Prisma"
import { ApiError } from "../helpers/Error"

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
      throw new ApiError("api-key-already-exists", 409)
    }

    const existingScopes: ApiScope[] = []
    for (const scope of scopes) {
      if (!Object.values(ApiScope).includes(scope as ApiScope)) {
        throw new ApiError("invalid-scope", 400)
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
