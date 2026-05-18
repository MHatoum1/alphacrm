// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./redux/store";
// Import i18n so it is initialized
import "./i18n.ts";

// (Optional) If you have a global CSS or your legacy app.css:
import "./App.css"; // your existing CSS
import { APP_MODE } from "./constants.ts";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const AppTree = (
  <Provider store={store}>
    <App />
  </Provider>
);

if (APP_MODE === "development") {
  // in development only
  root.render(<React.StrictMode>{AppTree}</React.StrictMode>);
} else {
  // in production build
  root.render(AppTree);
}
