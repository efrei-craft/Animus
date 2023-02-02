import prisma from "../../../clients/Prisma";
import {ApiScope, Prisma} from "@prisma/client";

export type ApiKey = Prisma.ApiKeyGetPayload<{
  select: {
    id: true,
    scopes: true,
  }
}>;

export async function bearerToken(bearer: string | undefined) {
  if (bearer?.split(" ")[0] === "Bearer") {
    const token = bearer?.split(" ")[1]

    if (token) {
      const apiKey = await prisma.apiKey.findUnique({
        where: {
          id: token,
        },
        select: {
          id: true,
          scopes: true,
        }
      });

      if (!apiKey) {
        throw new Error("invalid_api_key")
      }

      return apiKey;
    } else {
      throw new Error("invalid_request")
    }
  } else {
    throw new Error("invalid_request")
  }
}

export function scopeToken(scopes: ApiScope[], key: ApiKey) {
  if (scopes.every(scope => key.scopes.includes(scope))) {
    return true;
  } else {
    throw new Error("insufficient_scope")
  }
}

