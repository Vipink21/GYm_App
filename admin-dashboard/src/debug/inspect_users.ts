import { supabase } from '../lib/supabase'

export async function inspectUserTable() {
    console.log('Inspecting users table...')
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) console.error(error)
    else console.log('User Row:', data)
}
