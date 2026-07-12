import { createHashRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { Home } from "./screens/Home";
import { Settings } from "./screens/Settings";

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
  return <RouterProvider router={router} />;
}
