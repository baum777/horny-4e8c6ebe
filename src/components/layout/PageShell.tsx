import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageShellProps {
  children: React.ReactNode;
  page: string;
  state?: "active" | "teaser" | "locked";
  energy?: number;
  flavor?: string;
}

export function PageShell({
  children,
  page,
  state = "active",
  energy = 1,
  flavor = "default",
}: PageShellProps) {
  const location = useLocation();

  useEffect(() => {
    document.body.dataset.page = page;
    document.body.dataset.state = state;
    document.body.dataset.energy = energy.toString();
    document.body.dataset.flavor = flavor;

    // Cleanup on unmount (optional, but good practice if we want to reset)
    return () => {
      // We don't strictly clear them to avoid flickering, 
      // the next PageShell will overwrite them immediately.
    };
  }, [page, state, energy, flavor, location]);

  return <>{children}</>;
}

