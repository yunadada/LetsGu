import "./App.css";
import { Route, Routes } from "react-router-dom";
import routes from "./router/router";
const { publicRoutes, AuthenticateRoutes } = routes;

function App() {
  return (
    <Routes>
      {publicRoutes.map((route, index) => {
        const { path, element } = route;
        return <Route key={index} path={path} element={element} />;
      })}
      {AuthenticateRoutes.map((route, index) => {
        const { path, element } = route;
        return <Route key={index} path={path} element={element} />;
      })}
    </Routes>
  );
}

export default App;
