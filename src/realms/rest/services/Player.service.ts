import prisma from "../../../clients/Prisma";
import {PlayerPublicSelect} from "../schemas/Player.schema";
import {Player} from "@prisma/client";
import {Service} from "fastify-decorators";

@Service()
export default class PlayerService {

  async createPlayer(uuid: string, username: string): Promise<Partial<Player>> {
    const defaultGroups = await prisma.permGroup.findMany({
      where: {
        defaultGroup: true,
      },
      select: {
        id: true,
      }
    });

    const player = await prisma.player.create({
      data: {
        uuid,
        username,
        permGroups: {
          connect: defaultGroups.map(group => {
            return {
              id: group.id,
            }
          })
        }
      },
      select: PlayerPublicSelect,
    });

    return player;
  }

  async fetchPlayer(uuid: string, username: string): Promise<Partial<Player>> {
    try {
      const player = await prisma.player.findUnique({
        where: {
          uuid: uuid,
        },
        select: PlayerPublicSelect,
      });
      if(!player) {
        return this.createPlayer(uuid, username);
      }
      return player;
    } catch (e) {
      throw new Error(e.message);
    }
  }

}