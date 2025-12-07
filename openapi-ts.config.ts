import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input:
    "https://github.com/EthanThatOneKid/worlds-api/raw/main/src/openapi.json",
  output: "./openapi",

  // https://heyapi.dev/openapi-ts/clients/next-js
  plugins: ["@hey-api/client-next"],
});
