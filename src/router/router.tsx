import ActivityLog from "../Pages/ActivityLog/ActivityLog";
import EditProfile from "../Pages/EditProfile/EditProfile";
import LocationVerifyPage from "../Pages/LocationVerifyPage/LocationVerifyPage";
import Main from "../Pages/Main";
import MyPage from "../Pages/MyPage/MyPage";
import PhotoVerifyPage from "../Pages/PhotoVerifyPage/PhotoVerifyPage";
import ReviewDetail from "../Pages/Review/ReviewDetail/ReviewDetail";
import ReviewWrite from "../Pages/Review/ReviewWrite/ReviewWrite";

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
];

const authenticateRoutes: RouteConfig[] = [];

export default { publicRoutes, authenticateRoutes };
