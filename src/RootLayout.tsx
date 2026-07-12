import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
