import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="w-full h-full overflow-hidden">
      <Outlet />
    </div>
  );
}
