import Landing from "@/components/landing/Landing";

// Public marketing landing. Authenticated visitors are redirected to their
// dashboard by `proxy.ts` before this renders, so this only serves logged-out users.
export default function Home() {
  return <Landing />;
}
