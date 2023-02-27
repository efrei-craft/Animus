import prisma from "../../../clients/Prisma"
import { ApiScope } from "@prisma/client"
import { ApiError } from "./Error"

export type ApiKey = {
  key: string
  scopes: ApiScope[]
}

export async function fetchApiKey(key: string | undefined): Promise<ApiKey> {
  if (key) {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        key
      },
      select: {
        key: true,
        scopes: true
      }
    })

    if (!apiKey) {
      throw new ApiError("invalid-api-key", 401)
    }

    return apiKey
  } else {
    throw new ApiError("missing-api-key", 401)
  }
}

export function hasAuthorization(scopes: ApiScope[], key: ApiKey) {
  if (scopes.every((scope) => key.scopes.includes(scope))) {
    return true
  } else if (key.scopes.includes(ApiScope.ALL)) {
    return true
  } else {
    throw new ApiError(`missing-scopes`, 403)
  }
}
