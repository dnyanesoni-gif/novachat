import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data, error } = await supabase
    .from('waiting_users')
    .select('*')

  return (
    <div style={{ background: 'black', color: 'white', minHeight: '100vh', padding: '40px' }}>
      <h1>Supabase Connected ✅</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}
