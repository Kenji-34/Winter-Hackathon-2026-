-- Run this in the Supabase Dashboard → SQL Editor.

-- 1. `content` must be nullable: a note can legitimately exist between
--    quiz-pass and format-pick with no content yet (see CLAUDE.md §5).
alter table notes alter column content drop not null;

-- 2. Public storage bucket for captured/seeded slide images.
insert into storage.buckets (id, name, public)
values ('slides', 'slides', true)
on conflict (id) do nothing;

-- Authenticated users can upload into the bucket.
create policy "authenticated users can upload slides"
on storage.objects for insert
to authenticated
with check (bucket_id = 'slides');

-- Public bucket already serves reads publicly; this just lets owners
-- manage (overwrite/delete) their own uploads if needed later.
create policy "authenticated users can manage their own slides"
on storage.objects for all
to authenticated
using (bucket_id = 'slides' and owner = auth.uid())
with check (bucket_id = 'slides' and owner = auth.uid());
