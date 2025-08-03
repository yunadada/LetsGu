import Main from "../Pages/Main";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Main />,
  },
];

const authenticateRoutes: RouteConfig[] = [];

export default { publicRoutes, authenticateRoutes };
