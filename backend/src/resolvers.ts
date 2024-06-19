import { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: {
    listBatches: (_, __, { dataSources }) => {
      return dataSources.bftCloudFunctions.listBatches();
    },
    
    batch: (_, { id }, { dataSources }) => {
      return dataSources.bftCloudFunctions.getBatch(id);
    },
  },
  
  Batch: {
    readings: ({ id }, _, { dataSources }) => {
      return dataSources.bftCloudFunctions.getBatchReadings(id);
    },
  },
  
  Mutation: {
    newBatch: async (_, { input }, { dataSources }) => {
      const response = await dataSources.bftCloudFunctions.newBatch(input);
      
      if (response) {
        return {
          code: 200,
          success: response.success,
          error: response.error,
        };
      }
      
      return {
        code: 500,
        success: false,
        error: "Null response returned from datasource"
      };
    },
    
    addBatchReading: async (_, { input }, { dataSources }) => {
      const response = await dataSources.bftCloudFunctions.addBatchReading(input);
      
      if (response) {
        return {
          code: 200,
          success: response.success,
          error: response.error,
        };
      }
      
      return {
        code: 500,
        success: false,
        error: "Null response returned from datasource"
      };
    },
    
    updateBatch: async (_, { input }, { dataSources }) => {
      const response = await dataSources.bftCloudFunctions.updateBatch(input);
      
      if (response) {
        return {
          code: 200,
          success: response.success,
          error: response.error,
        };
      }
      
      return {
        code: 500,
        success: false,
        error: "Null response returned from datasource"
      };
    },
    
    deleteBatch: async (_, { id }, { dataSources }) => {
      const response = await dataSources.bftCloudFunctions.deleteBatch(id);
      
      if (response) {
        return {
          code: 200,
          success: response.success,
          error: response.error,
        };
      }
      
      return {
        code: 500,
        success: false,
        error: "Null response returned from datasource"
      };
    },
  },
};
