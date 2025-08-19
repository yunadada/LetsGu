import "./App.css";
import { Route, Routes } from "react-router-dom";
import routes from "./router/router";
const { publicRoutes, authenticateRoutes } = routes;
import type { RouteConfig } from "./router/router";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  const allRoutes: RouteConfig[] = [...publicRoutes, ...authenticateRoutes];

  return (
    <div>
      <ToastContainer position="top-center" autoClose={3000} limit={1} />
      <Routes>
        {allRoutes.map((route) => {
          const { path, element } = route;
          return <Route key={path} path={path} element={element} />;
        })}
      </Routes>
    </div>
  );
}

export default App;
