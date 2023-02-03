export default {
  $id: 'Player',
  type: 'object',
  properties: {
    uuid: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    permGroups: {
      type: 'array',
      items: {
        $ref: 'PermGroup#',
      }
    },
    _count: {
      type: 'object',
      properties: {
        friends: {
          type: 'number',
        }
      }
    },
    discordUserId: {
      type: 'string',
    }
  }
}