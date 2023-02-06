import prisma from "../../../clients/Prisma"
import { ApiScope } from "@prisma/client"

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
      throw new Error("invalid_api_key")
    }

    return apiKey
  } else {
    throw new Error("missing_api_key")
  }
}

export function hasAuthorization(scopes: ApiScope[], key: ApiKey) {
  if (scopes.every((scope) => key.scopes.includes(scope))) {
    return true
  } else if (key.scopes.includes(ApiScope.ALL)) {
    return true
  } else {
    let missingScopes = scopes.filter((scope) => !key.scopes.includes(scope))
    throw new Error(
      "insufficient_scope (missing " + missingScopes.join(", ") + ")"
    )
  }
}
