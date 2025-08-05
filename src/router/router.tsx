import Main from "../Pages/Main";
import Map from "../Pages/Map";

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

const authenticateRoutes: RouteConfig[] = [{ path: "/map", element: <Map /> }];

export default { publicRoutes, authenticateRoutes };
