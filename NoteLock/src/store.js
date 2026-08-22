import { supabase } from './supabase'

// ── Subjects ──────────────────────────────────────────────────────────────────

export async function getSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addSubject({ name, color }) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name, color })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) throw error
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getNotes(subjectId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getNote(id) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function addNote({ subjectId, title, topic, tags, content, questions, imageUrl, formatId = 'outline' }) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      subject_id: subjectId,
      title,
      topic,
      tags,
      content,
      questions,
      image_url: imageUrl ?? null,
      format_id: formatId,
      unlocked: false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unlockNote(id) {
  const { data, error } = await supabase
    .from('notes')
    .update({ unlocked: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNoteFormat(id, formatId) {
  const { data, error } = await supabase
    .from('notes')
    .update({ format_id: formatId })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

// ── Image upload ──────────────────────────────────────────────────────────────

export async function uploadSlide(blob) {
  const filename = `${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('slides').upload(filename, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('slides').getPublicUrl(filename)
  return data.publicUrl
}
