import ActivityLog from "../Pages/ActivityLog/ActivityLog";
import EditProfile from "../Pages/EditProfile/EditProfile";
import LocationVerifyPage from "../Pages/LocationVerifyPage/LocationVerifyPage";
import Login from "../Pages/Login/Login";
import Main from "../Pages/Main/Main";
import MapPage from "../Pages/MapPage/MapPage";
import MyPage from "../Pages/MyPage/MyPage";
import PhotoVerifyPage from "../Pages/PhotoVerifyPage/PhotoVerifyPage";
import RewardShop from "../Pages/RewardShop/RewardShop";
import Wallet from "../Pages/Wallet/Wallet";
import ReviewDetail from "../Pages/Review/ReviewDetail/ReviewDetail";
import ReviewWrite from "../Pages/Review/ReviewWrite/ReviewWrite";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

const publicRoutes: RouteConfig[] = [
  {
    path: "/login",
    element: <Login />,
  },
];

const authenticateRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Main />,
  },
  { path: "/map", element: <MapPage /> },
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
    path: "/activityLog",
    element: <ActivityLog />,
  },
  {
    path: "/reviewDetail",
    element: <ReviewDetail />,
  },
  {
    path: "/reviewWrite",
    element: <ReviewWrite />,
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

export default { publicRoutes, authenticateRoutes };
