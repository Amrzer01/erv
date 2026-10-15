import { supabase } from "@/lib/supabase/client";

export default async function Page() {
  const { data } = await supabase.from("clients").select("*");

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
