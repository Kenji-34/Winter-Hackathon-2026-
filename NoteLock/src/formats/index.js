import * as cornell from './cornell.js'
import * as outline from './outline.js'
import * as list from './list.js'

export const formats = [
  { id: 'cornell', name: 'Cornell', ...cornell },
  { id: 'outline', name: 'Outline', ...outline },
  { id: 'list', name: 'List', ...list },
]

export function getFormat(id) {
  return formats.find(format => format.id === id)
}
