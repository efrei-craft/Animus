import { Service } from "fastify-decorators"
import { ApiError } from "../../helpers/Error"
import axios from "axios"
import { FederatedLoginBody } from "../schemas/Auth.schema"
import prisma from "../../../../clients/Prisma"
import { randomUUID } from "crypto"
import { Prisma } from "@prisma/client"

@Service()
export default class AuthService {
  public static AdminAccessSelect: Prisma.AdminAccessSelect = {
    email: true,
    name: true,
    nickname: true,
    groups: true,
    apiKey: {
      select: {
        key: true,
        scopes: true
      }
    }
  }

  generateFederatedLoginUrl(): FederatedLoginBody {
    const clientId = process.env.OAUTH2_CLIENT_ID
    const redirectUri = process.env.OAUTH2_REDIRECT_URI

    if (!clientId || !redirectUri) {
      throw new ApiError("incorrect-auth-config", 500)
    }

    return {
      redirect: `https://auth.efreicraft.fr/application/o/authorize/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=profile%20openid%20email`
    }
  }

  private async fetchUserInfo(code: string): Promise<{
    email: string
    name: string
    nickname: string
    groups: string[]
  }> {
    const clientId = process.env.OAUTH2_CLIENT_ID
    const clientSecret = process.env.OAUTH2_CLIENT_SECRET
    const redirectUri = process.env.OAUTH2_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new ApiError("incorrect-auth-config", 500)
    }

    const {
      data: { access_token }
    } = await axios(`https://auth.efreicraft.fr/application/o/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code
      }
    })

    const { data: userInfo } = await axios(
      "https://auth.efreicraft.fr/application/o/userinfo/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    return {
      email: userInfo.email,
      name: userInfo.name,
      nickname: userInfo.nickname,
      groups: userInfo.groups
    }
  }

  async redeemCode(code: string) {
    try {
      const userInfo = await this.fetchUserInfo(code)

      let adminAccess = await prisma.adminAccess.findUnique({
        where: {
          email: userInfo.email
        },
        select: AuthService.AdminAccessSelect
      })

      if (!adminAccess) {
        adminAccess = await prisma.adminAccess.create({
          data: {
            ...userInfo,
            apiKey: {
              create: {
                key: randomUUID(),
                description: "User API Key",
                scopes: ["ALL"]
              }
            }
          },
          select: AuthService.AdminAccessSelect
        })
      }

      return adminAccess
    } catch (error) {
      console.error(error)
      throw new ApiError("invalid-code", 401)
    }
  }
}
