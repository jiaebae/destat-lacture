import { supabase } from "~/postgres/supaclient";

export async function loader() {
  const { data } = await supabase().from("destat table").select("*");
  console.log(data);
}

export default function Home() {
  return <div>Hello destat world</div>;
}
