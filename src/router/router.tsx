import EditProfile from "../Pages/EditProfile/EditProfile";
import LocationVerifyPage from "../Pages/LocationVerifyPage/LocationVerifyPage";
import Main from "../Pages/Main";
import Map from "../Pages/MapPage/Map";
import MyPage from "../Pages/MyPage/MyPage";
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
  {
    path: "/myPage",
    element: <MyPage />,
  },
  {
    path: "/editProfile",
    element: <EditProfile />,
  },
];

const authenticateRoutes: RouteConfig[] = [{ path: "/map", element: <Map /> }];

export default { publicRoutes, authenticateRoutes };
