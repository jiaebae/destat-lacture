import { supabase } from "~/postgres/supaclient";

export async function loader() {
  if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }
  const { data } = await supabase().from("destat table").select("*");
  console.log(data);
}

export default function Home() {
  return <div>Hello destat world</div>;
}
