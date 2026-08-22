export const schema = {
  type: 'object',
  properties: {
    mainTopic: { type: 'string' },
    subtopics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          keyPoints: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 6,
          },
        },
        required: ['name', 'keyPoints'],
      },
      minItems: 1,
      maxItems: 5,
    },
  },
  required: ['mainTopic', 'subtopics'],
}

export const promptHint =
  'Organize the slide into a main topic with nested subtopics and key points, outline style.'

export function render(data) {
  return {
    kind: 'outline',
    mainTopic: data.mainTopic,
    subtopics: data.subtopics,
  }
}
