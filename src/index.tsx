// src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="153709521844-r4skulpsojn7aeu95iv0dtrsttjg1v34.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
