import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lacvsoqzivufinhspuzh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhY3Zzb3F6aXZ1ZmluaHNwdXpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMwMDQyNiwiZXhwIjoyMDkyODc2NDI2fQ.tIgxXcWpZ7yozfxkOrb7q5Vrl2KPY4amifHRQs1t4Zw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase
    .from('applications_with_queue_status')
    .select('*')
    .eq('reference_no', 'DP-2026-0021')

  console.log("--- VIEW DATA for DP-2026-0021 ---")
  console.log(data)
  console.log("Error:", error)

  const { data: rawApp } = await supabase
    .from('applications')
    .select('*')
    .eq('reference_no', 'DP-2026-0021')
    .single()
  
  console.log("\n--- RAW TABLE DATA for DP-2026-0021 ---")
  console.log("Current Stage:", rawApp?.current_stage)
}
run()
