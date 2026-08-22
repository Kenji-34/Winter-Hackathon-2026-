export const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      maxItems: 10,
    },
  },
  required: ['items'],
}

export const promptHint =
  "Extract the slide's content as a flat numbered list of concise points."

export function render(data) {
  return {
    kind: 'list',
    items: data.items,
  }
}
