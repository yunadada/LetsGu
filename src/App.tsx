import "./App.css";
import { Route, Routes } from "react-router-dom";
import routes from "./router/router";
const { publicRoutes, AuthenticateRoutes } = routes;
import type { RouteConfig } from "./router/router";

function App() {
  const allRoutes: RouteConfig[] = [...publicRoutes, ...authenticatedRoutes];
  
  return (
    <Routes>
      {allRoutes.map((route) => {
        const { path, element } = route;
        return <Route key={path} path={path} element={element} />;
      })}
    </Routes>
  );
}

export default App;
