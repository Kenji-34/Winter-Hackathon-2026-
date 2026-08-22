// Writes real demo subjects + already-unlocked notes into Supabase under
// the currently signed-in user (no quiz needed to view them) — see
// CLAUDE.md §11. Run once from the UI; safe to run again, it just adds
// another copy of the same subjects.
import { addSubject, addNote, unlockNote } from './store'

const DEMO_SUBJECTS = [
  {
    name: 'Operating Systems',
    color: '#909090',
    notes: [
      {
        title: 'Recovering with a Journal',
        topic: 'File Systems',
        tags: ['Journaling', 'File Systems', 'Crash Recovery'],
        formatId: 'list',
        content: {
          items: [
            'A journal logs intended writes before they touch the main filesystem, so a crash mid-write can be replayed or rolled back.',
            'On boot, three record states drive recovery: record-only (delete if expired), record+object (write missing metadata), record+object+metadata (drop the now-redundant record).',
            'Deleting orphaned records too early races with slow in-flight writes; expiry thresholds are set well above the max write duration to avoid this.',
            'EXT3, EXT4, and NTFS all use journaling to skip a full disk consistency check after an unclean shutdown.',
          ],
        },
      },
    ],
  },
  {
    name: 'Databases',
    color: '#8A6CFF',
    notes: [
      {
        title: 'ACID Transactions',
        topic: 'Transaction Management',
        tags: ['ACID', 'Transactions', 'Isolation'],
        formatId: 'cornell',
        content: {
          title: 'ACID Transactions',
          rows: [
            { keyword: 'Atomicity', mainPoint: 'A transaction commits fully or not at all — no partial writes survive a crash.' },
            { keyword: 'Consistency', mainPoint: 'A transaction moves the database from one valid state to another, respecting all constraints.' },
            { keyword: 'Isolation', mainPoint: 'Concurrent transactions behave as if run one at a time, even when interleaved.' },
            { keyword: 'Durability', mainPoint: 'Once committed, a transaction survives power loss — usually via a write-ahead log.' },
          ],
          summary: 'ACID guarantees let application code treat a multi-step database operation as a single, safe unit of work.',
        },
      },
    ],
  },
  {
    name: 'Networks',
    color: '#FF6B91',
    notes: [
      {
        title: 'The TCP Three-Way Handshake',
        topic: 'Transport Layer',
        tags: ['TCP', 'Handshake', 'Connections'],
        formatId: 'outline',
        content: {
          mainTopic: 'TCP Three-Way Handshake',
          subtopics: [
            {
              name: 'Establishing a connection',
              keyPoints: [
                'Client sends SYN with an initial sequence number',
                'Server replies SYN-ACK, acknowledging and sending its own sequence number',
                'Client replies ACK — connection is now open in both directions',
              ],
            },
            {
              name: 'Why three steps',
              keyPoints: [
                'Both sides need to prove they can send AND receive before data flows',
                'Sequence numbers agreed here let both sides detect lost or reordered packets later',
              ],
            },
          ],
        },
      },
    ],
  },
]

// Every note needs a non-null `questions` field even when it's never
// quizzed (the DB column is NOT NULL) — a placeholder is fine here.
const PLACEHOLDER_QUESTIONS = [
  {
    q: 'This is a pre-made note, not one generated from a captured slide — was a quiz required to unlock it?',
    options: ['Yes', 'No'],
    answer: 1,
    explanation: 'Pre-made/seed notes are created already unlocked, so there is nothing to answer here.',
  },
]

export async function seedDemoData() {
  const created = []
  for (const subject of DEMO_SUBJECTS) {
    const savedSubject = await addSubject({ name: subject.name, color: subject.color })
    for (const note of subject.notes) {
      const savedNote = await addNote({
        subjectId: savedSubject.id,
        title: note.title,
        topic: note.topic,
        tags: note.tags,
        content: note.content,
        questions: PLACEHOLDER_QUESTIONS,
        imageUrl: null,
        formatId: note.formatId,
      })
      await unlockNote(savedNote.id)
    }
    created.push(savedSubject.name)
  }
  return created
}
