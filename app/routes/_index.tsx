import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import MuxUploader from "@mux/mux-uploader-react";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Mux from "@mux/mux-node";
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