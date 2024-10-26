import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Kelas Tech" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className='p-4 border-b h-full flex items-center bg-white shadow-sm'>

      <div className="flex gap-x-2 ml-auto">
          <Link to="/login">Login</Link>
      </div>
    </div>
  );
}