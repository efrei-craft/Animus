import { Controller } from "fastify-decorators"
import PunishmentsService from "../services/Punishments.service"

@Controller({ route: "/queues" })
export default class PunishmentsController {
  constructor(readonly punishmentService: PunishmentsService) {}
}
