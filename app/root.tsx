import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getToast } from "remix-toast";
import toast, { Toaster } from "react-hot-toast";

import "./tailwind.css";
import { useEffect } from "react";
import { getConfetti } from "~/utils/confetti.server";
import { Confetti } from "~/components/confetti";

import clsx from "clsx"
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes"

import { themeSessionResolver } from "~/utils/theme.server"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "manifest",
    href: "/manifest.json",
  },
  {
    rel: "icon",
    href: "/favicon.ico",
    type: "image/svg+xml",
  },
  {
    rel: "icon",
    href: "/favicon-16x16.png",
    type: "image/png",
    sizes: "16x16",
  },
  {
    rel: "icon",
    href: "/favicon-32x32.png",
    type: "image/png",
    sizes: "32x32",
  },
  {
    rel: "icon",
    href: "/favicon-96x96.png",
    type: "image/png",
    sizes: "96x96",
  },
  {
    rel: "icon",
    href: "/favicon-192x192.png",
    type: "image/png",
    sizes: "192x192",
  },
  {
    rel: "icon",
    href: "/favicon-512x512.png",
    type: "image/png",
    sizes: "512x512",
  },
  {
    rel: "apple-touch-icon",
    href: "/favicon-57x57.png",
    type: "image/png",
    sizes: "57x57",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get both toast and confetti from the request
  const [{ toast, headers: toastHeaders }, { confetti, headers: confettiHeaders }, { getTheme }] =
    await Promise.all([
      getToast(request),
      getConfetti(request),
      themeSessionResolver(request)
    ]);

  // Combine the headers
  const headers = new Headers(toastHeaders);
  for (const [key, value] of new Headers(confettiHeaders).entries()) {
    headers.append(key, value);
  }
  // Important to pass in the headers so the toast is cleared properly
  return json({
    toastLib: toast,
    confetti,
    themeLib: getTheme()
  }, { headers });
}

export default function AppWithProviders() {
  const { themeLib } = useLoaderData<typeof loader>();


  return (
    <>
      <ThemeProvider specifiedTheme={themeLib} themeAction="/api/theme">
        <App />
      </ThemeProvider>
    </>
  );
}

function App() {
  const { toastLib, confetti, themeLib } = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  useEffect(() => {
    if (toastLib) {
      switch (toastLib.type) {
        case "success":
          toast.success(toastLib.message);
          break;
        case "error":
          toast.error(toastLib.message);
          break;
        default:
          toast(toastLib.message);
          break;
      }
    }
  }, [toastLib])

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="msapplication-TileColor" content="#FFFFFF" />
        <meta name="msapplication-TileImage" content="/favicon-512x512.png" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(themeLib)} />
        <Links />
      </head>
      <body>
        <Toaster />
        <Confetti id={confetti} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
