import { InactivityGuard } from "@/components/InactivityGuard";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <InactivityGuard>{children}</InactivityGuard>;
}
