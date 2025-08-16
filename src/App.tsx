import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Route, Routes } from "react-router-dom";
import type { RouteConfig } from "./router/router";

import routes from "./router/router";
const { publicRoutes, authenticateRoutes } = routes;
import "./App.css";
import Map from "./Pages/MapPage/Map";

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <h1>Loading...</h1>;
    case Status.FAILURE:
      return <h1>Error loading map</h1>;
    case Status.SUCCESS:
      return <Map></Map>; // No need to render anything here, as the map is handled in the
  }
};

function App() {
  const allRoutes: RouteConfig[] = [...publicRoutes, ...authenticateRoutes];

  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} render={render}>
      <Routes>
        {allRoutes.map((route) => {
          const { path, element } = route;
          return <Route key={path} path={path} element={element} />;
        })}
      </Routes>
    </Wrapper>
  );
}

export default App;
