import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Button } from "~/components/ui/button";



export const meta: MetaFunction = () => {
  return [
    { title: "Kelas Tech" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function LandingPage() {

  return (
    <div>
      <h1>Landing page</h1>
    </div>

  );
}