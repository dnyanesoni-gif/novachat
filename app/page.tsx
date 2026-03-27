import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data, error } = await supabase
    .from('waiting_users')
    .select('*')

  return (
    <div style={{ backgroundColor: 'red', color: 'white', minHeight: '100vh', padding: '40px', fontSize: '24px' }}>
      <h1>TEST PAGE LOADED ✅</h1>
      <p>Supabase check below:</p>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}
