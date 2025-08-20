import EditProfile from "../Pages/EditProfile/EditProfile";
import LocationVerifyPage from "../Pages/LocationVerifyPage/LocationVerifyPage";
import Main from "../Pages/Main";
import MapPage from "../Pages/MapPage/MapPage";
import MyPage from "../Pages/MyPage/MyPage";
import PhotoVerifyPage from "../Pages/PhotoVerifyPage/PhotoVerifyPage";
import RewardShop from "../Pages/RewardShop/RewardShop";
import Wallet from "../Pages/Wallet/Wallet";

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
  {
    path: "/shop",
    element: <RewardShop />,
  },
  {
    path: "/wallet",
    element: <Wallet />,
  },
];

const authenticateRoutes: RouteConfig[] = [
  { path: "/map", element: <MapPage /> },
];

export default { publicRoutes, authenticateRoutes };
