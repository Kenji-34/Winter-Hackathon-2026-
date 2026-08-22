console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('KEY LENGTH:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length)
console.log('KEY PREFIX:', import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20))

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

export const supabase = createClient(url, key)
