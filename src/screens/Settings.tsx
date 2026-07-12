import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Settings() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate("/")}>
      Go to Home
    </Button>
  );
}
