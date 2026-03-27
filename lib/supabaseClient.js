import { createClient } from '@supabase/supabase-js'

// Supabase project URL aur ANON key yaha daalo
const supabaseUrl = "https://agjvfexvanveyaqrkjki.supabase.co"
const supabaseKey = "sb_publishable_eJoeMEzXL3jjbRin6TeEsg_vSjoXTdB"

export const supabase = createClient(supabaseUrl, supabaseKey)
