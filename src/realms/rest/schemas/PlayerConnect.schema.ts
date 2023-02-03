import {FastifySchema} from "fastify";
import {Static, Type} from '@sinclair/typebox';
import PlayerSchema from "./common/Player.schema";

enum PlayerConnectError {
  USER_BANNED = 'user-banned',
}

const PlayerConnectBodySchema = Type.Object({
  uuid: Type.String(),
  username: Type.String(),
}, { $id: 'PlayerConnectBody' });

export const PlayerConnectSchema: FastifySchema = {
  tags: ['players'],
  summary: 'A player connects to the server',
  security: [
    {
      bearerAuth: []
    }
  ],
  body: PlayerConnectBodySchema,
  response: {
    200: Type.Ref(PlayerSchema),
    400: Type.Object({
      error: Type.String({ enum: Object.values(PlayerConnectError) }),
      message: Type.String(),
    }, { $id: 'PlayerConnectError' }),
  },
};

export type PlayerConnectBodySchema = Static<typeof PlayerConnectBodySchema>;