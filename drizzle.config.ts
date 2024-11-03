import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./app/db/schema.server.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "0283b7a1dcc086c6bc0c64923ddcb482",
    databaseId: "c183d415-5b3b-4f24-aa98-9ce8cf591a32",
    token: "Amc_fdr9B5DM_lAptPsGqjvVPHHwaK6yxTm9tIyW",
  },
});
