export const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword: { type: 'string' },
          mainPoint: { type: 'string' },
        },
        required: ['keyword', 'mainPoint'],
      },
      minItems: 3,
      maxItems: 6,
    },
    summary: { type: 'string' },
  },
  required: ['title', 'rows', 'summary'],
}

export const promptHint =
  'Extract 3-5 keyword/main-point pairs for a Cornell notes table.'

export function render(data) {
  return {
    kind: 'cornell',
    title: data.title,
    rows: data.rows,
    summary: data.summary,
  }
}
