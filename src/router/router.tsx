import Main from "../Pages/Main";
import type { JSX } from "react";

interface RouteConfig {
  path: string;
  element: JSX.Element;
}

const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Main />,
  },
];

const AuthenticateRoutes: RouteConfig[] = [];

export default { publicRoutes, AuthenticateRoutes };
