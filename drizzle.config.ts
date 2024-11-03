import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./app/db/schema.server.ts",
  dialect: "sqlite",
  driver: "d1-http",
});
