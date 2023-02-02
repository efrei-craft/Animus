import prisma from "../../../clients/Prisma";
import {ApiScope} from "@prisma/client";

export type ApiKey = {
  key: string;
  scopes: ApiScope[];
}

export async function bearerToken(bearer: string | undefined): Promise<ApiKey> {
  if (bearer?.split(" ")[0] === "Bearer") {
    const token = bearer?.split(" ")[1]

    if (token) {
      const apiKey = await prisma.apiKey.findUnique({
        where: {
          key: token,
        },
        select: {
          key: true,
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

