import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema.graphql",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./context#DataSourceContext",
        mappers: {
          Batch: "./models#BatchModel",
          Reading: "./models#ReadingModel",
          ModifyDataResponse: "./models#ModifyDataResponseModel",
        },
      },
    },
  },
};

export default config;
