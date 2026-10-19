import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/home/pages/home.tsx"),
  route("profile/survey", "features/profile/pages/survey.tsx"),
] satisfies RouteConfig;
