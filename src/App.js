import React from "react";
import { Switch } from "react-router";
import "rsuite/dist/rsuite.min.css";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ProfileProvider } from "./context/profile.context";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Chat from "./pages/Home/Chat"; // ✅ added this
import "./styles/main.scss";

function App() {
  return (
    <ProfileProvider>
      <Switch>
        <PublicRoute path="/signin">
          <SignIn />
        </PublicRoute>

        {/* ✅ Added route for room links */}
        <PrivateRoute path="/room/:chatId">
          <Chat />
        </PrivateRoute>

        <PrivateRoute path="/">
          <Home />
        </PrivateRoute>
      </Switch>
    </ProfileProvider>
  );
}

export default App;
