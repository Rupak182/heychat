import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Home() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate("/settings")}>
      Go to Settings
    </Button>
  );
}
