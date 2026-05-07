import { createClient } from '@supabase/supabase-js'

// Đã xóa đuôi /rest/v1/ ở cuối URL
const supabaseUrl = 'https://hjkllgoqtgfoohqmumna.supabase.co'
const supabaseKey = 'sb_publishable_Rxe58Kj4bqIoRn3QuK1t-g_al7slvHk'

export const supabase = createClient(supabaseUrl, supabaseKey)