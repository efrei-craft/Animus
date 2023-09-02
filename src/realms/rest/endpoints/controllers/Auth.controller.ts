import { FastifyReply, FastifyRequest } from "fastify"
import { Controller, GET, POST } from "fastify-decorators"
import {
  FederatedCallbackBody,
  FederatedCallbackSchema,
  FederatedLoginSchema
} from "../schemas/Auth.schema"
import AuthService from "../services/Auth.service"

@Controller({ route: "/auth" })
export default class GamesController {
  constructor(private authService: AuthService) {}

  @GET({
    url: "/federated",
    options: {
      schema: FederatedLoginSchema
    }
  })
  async federatedLogin(request: FastifyRequest, reply: FastifyReply) {
    const federatedLoginUrl = this.authService.generateFederatedLoginUrl()
    return reply.code(200).send(federatedLoginUrl)
  }

  @POST({
    url: "/federated/callback",
    options: {
      schema: FederatedCallbackSchema
    }
  })
  async federatedCallback(
    request: FastifyRequest<{
      Body: FederatedCallbackBody
    }>,
    reply: FastifyReply
  ) {
    const code = request.body.code
    const userInfo = await this.authService.redeemCode(code)

    console.log(userInfo)
    return reply.code(200).send(userInfo)
  }
}
