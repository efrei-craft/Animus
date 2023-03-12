import RedisClient from "../../../clients/Redis"
import prisma from "../../../clients/Prisma"

/**
 * Sends a message to a player
 * @param proxyServer The name of the proxy server
 * @param prefix The prefix of the message
 * @param uuid The uuid of the player
 * @param message The message to send
 */
const sendMessageToPlayer = (
  proxyServer: string,
  prefix: string,
  uuid: string,
  message: string
) => {
  return RedisClient.getInstance().publishToPlugin(
    proxyServer,
    "Vicarius",
    "sendMessage",
    prefix,
    message,
    uuid
  )
}

/**
 * Sends a message to a player (warning: the database is queried here)
 * @param prefix The prefix of the message
 * @param uuid The uuid of the player
 * @param message The message to send
 */
const sendProxyMessageToPlayer = async (
  prefix: string,
  uuid: string,
  message: string
) => {
  const player = await prisma.player.findFirst({
    where: {
      uuid
    },
    select: {
      server: {
        select: {
          template: {
            select: {
              parentTemplate: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })

  return RedisClient.getInstance().publishToPlugin(
    player.server.template.parentTemplate.name,
    "Vicarius",
    "sendMessage",
    prefix,
    message,
    uuid
  )
}

export { sendMessageToPlayer, sendProxyMessageToPlayer }
