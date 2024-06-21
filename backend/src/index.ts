import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";
import { resolvers } from "./resolvers";
import { BFTCloudFunctions } from "./datasources/beer-fermentation-tracker-gcp-cloud-functions";
import 'dotenv/config';

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

async function startApolloServer() {
  const server = new ApolloServer({ 
    typeDefs,
    resolvers,
  });
  const { url } = await startStandaloneServer(server, {
    context: async () => {
      const { cache } = server;
    
      // this object becomes our resolver's contextValue, the third positional argument
      return {
        dataSources: {
          bftCloudFunctions: new BFTCloudFunctions({ cache }),
        },
      };
    },
    listen: {
      port: process.env.LISTEN_PORT ? parseInt(process.env.LISTEN_PORT) : 4000,
      localAddress: process.env.LISTEN_ADDRESS ? process.env.LISTEN_ADDRESS : "localhost"
    }
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
