// import { Routes, Route, Link } from "react-router-dom";

// function App() {
//   return (
//     <div style={{ padding: "2rem", fontSize: "1.2rem" }}>
//       <h1>React Router 기본 기능 테스트</h1>
      
//       {/* 테스트를 위한 내비게이션 링크 */}
//       <nav>
//         <a href="https://letsggu.duckdns.org/oauth2/authorization/kakao">
//           카카오 로그인 시작 (이 링크를 클릭하세요)
//         </a>
//       </nav>

//       <hr style={{ margin: "2rem 0" }} />

//       {/* 라우팅 결과가 표시되는 곳 */}
//       <Routes>
//         <Route 
//           path="/auth/callback" 
//           element={
//             <div style={{ color: "green" }}>
//               <h2>✅ 카카오 콜백 페이지 도착 성공!</h2>
//               <p>이 메시지가 보인다면 라우터 자체는 정상 동작하는 것입니다.</p>
//             </div>
//           } 
//         />
//         <Route 
//           path="*" 
//           element={
//             <div style={{ color: "red" }}>
//               <h2>❌ 현재 경로와 일치하는 라우트를 찾지 못했습니다.</h2>
//             </div>
//           } 
//         />
//       </Routes>
//     </div>
//   );
// }

// export default App;


import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Route, Routes } from "react-router-dom";
import type { RouteConfig } from "./router/router";
import routes from "./router/router";
const { publicRoutes, authenticateRoutes } = routes;
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./App.css";
import MapPage from "./Pages/MapPage/MapPage";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { AuthContext } from "./contexts/auth";

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <h1>Loading...</h1>;
    case Status.FAILURE:
      return <h1>Error loading map</h1>;
    case Status.SUCCESS:
      return <MapPage></MapPage>; // No need to render anything here, as the map is handled in the
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {/* <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} render={render}> */}
        
        <ToastContainer
          className="toastContainerCustom"
          position="top-center"
          autoClose={3000}
          limit={1}
        />
        <Routes>
          {publicRoutes.map((route: RouteConfig) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {authenticateRoutes.map((route: RouteConfig) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      {/* </Wrapper> */}
    </AuthContext.Provider>
  );
}

export default App;
