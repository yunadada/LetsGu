import LocationVerifyPage from "../Pages/LocationVerifyPage/LocationVerifyPage";
import Main from "../Pages/Main";
import PhotoVerifyPage from "../Pages/PhotoVerifyPage/PhotoVerifyPage";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/locationVerification",
    element: <LocationVerifyPage />,
  },

  {
    path: "/photoVerification",
    element: <PhotoVerifyPage />,
  },
];

const authenticateRoutes: RouteConfig[] = [];

export default { publicRoutes, authenticateRoutes };
