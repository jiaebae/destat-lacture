import { Link } from "react-router";
import WalletConnect from "~/components/ui/wallet-connect";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";

export default function Navigation() {
  return (
    <header className="relative grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 max-sm:grid-cols-2 max-sm:py-3">
      <Link to="/" className="justify-self-start text-base font-bold">
        DESTAT
      </Link>
      <NavigationMenu
        aria-label="Main navigation"
        className="max-sm:order-3 max-sm:col-span-2 max-sm:justify-self-center"
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink render={<Link to="/" />}>
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Survey</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                render={<Link to="/profile/survey" />}
                className="min-w-40"
              >
                My Survey
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Archive</NavigationMenuTrigger>
            <NavigationMenuContent>
              <p className="w-44 p-3 text-sm text-muted-foreground">
                No archived surveys
              </p>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                render={<Link to="/profile/survey" />}
                className="min-w-40"
              >
                My Survey
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <WalletConnect />
    </header>
  );
}
