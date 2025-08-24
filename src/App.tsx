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
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} render={render}>
        <ToastContainer position="top-center" autoClose={3000} limit={1} />
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
      </Wrapper>
    </AuthContext.Provider>
  );
}

export default App;
