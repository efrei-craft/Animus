export default {
  $id: 'PermGroup',
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    permissions: {
      type: 'array',
      items: {
        $ref: 'Permission#',
      }
    },
    prefix: {
      type: 'string',
    },
    color: {
      type: 'string',
    },
    bold: {
      type: 'boolean',
    },
    parentGroup: {
      $ref: 'PermGroup#',
    }
  }
}