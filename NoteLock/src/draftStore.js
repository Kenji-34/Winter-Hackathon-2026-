// Bridges Capture → Quiz → Format → Note across the hash router.
// Shape: { subjectId, image (resized dataURL), topic, title, tags, questions }
// Whoever builds Capture.jsx should populate this same shape before
// navigating to #/mcq; nothing downstream needs to change.

let draft = null

export function setDraft(next) {
  draft = { ...draft, ...next }
}

export function getDraft() {
  return draft
}

export function clearDraft() {
  draft = null
}
