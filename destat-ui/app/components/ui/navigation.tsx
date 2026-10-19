import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";

export default function Navigation() {
  const [account, setAccount] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");

  async function connect() {
    const provider = (window as Window & {
      ethereum?: { request(args: { method: string }): Promise<string[]> };
    }).ethereum;
    setMessage("");
    if (!provider) {
      setMessage("지갑 확장 프로그램을 설치한 뒤 다시 연결해 주세요.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0] ?? "");
      if (!accounts[0]) setMessage("연결된 계정이 없습니다.");
    } catch {
      setMessage("지갑 연결이 완료되지 않았습니다. 다시 시도해 주세요.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <header className="relative grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 max-sm:grid-cols-2 max-sm:py-3">
      <Link to="/" className="justify-self-start text-base font-bold">DESTAT</Link>
    <NavigationMenu aria-label="Main navigation" className="max-sm:order-3 max-sm:col-span-2 max-sm:justify-self-center">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink render={<Link to="/" />}>Dashboard</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Survey</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink render={<Link to="/profile/survey" />} className="min-w-40">My Survey</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Archive</NavigationMenuTrigger>
          <NavigationMenuContent>
            <p className="w-44 p-3 text-sm text-muted-foreground">No archived surveys</p>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink render={<Link to="/profile/survey" />} className="min-w-40">My Survey</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
      <Button onClick={connect} disabled={connecting} className="justify-self-end rounded-md" title={account || undefined}>
        {connecting ? "Connecting…" : account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect"}
      </Button>
      {message && <p role="status" className="absolute right-4 top-full z-50 max-w-80 rounded-md border bg-white p-3 text-sm shadow-sm">{message}</p>}
    </header>
  );
}
