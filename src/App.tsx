import { createHashRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { RootLayout } from "./RootLayout";
import { Home } from "./screens/Home";
import { Settings } from "./screens/Settings";
import { ThemeProvider } from "./components/theme-provider";

const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
