import {Player, Prisma} from "@prisma/client";

export const PlayerPublicSelect: Prisma.PlayerSelect = {
  uuid: true,
  username: true,
  permGroups: {
    select: {
      id: true,
      name: true,
      prefix: true,
      color: true,
      bold: true,
    }
  },
  _count: {
    select: {
      friends: true
    }
  },
  discordUserId: true,
}

export interface IPlayerConnect {
  uuid: string;
  username: string;
}

export const PlayerConnectSchema = {
  body: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
      },
      username: {
        type: 'string',
      }
    },
    required: ['uuid', 'username']
  },
  response: {
    200: {
      $ref: 'Player#',
    },
    400: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          enum: ['user-banned']
        },
        message: {
          type: 'string',
        }
      }
    }
  }
}