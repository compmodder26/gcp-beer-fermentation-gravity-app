import { BFTCloudFunctions } from "./datasources/beer-fermentation-tracker-gcp-cloud-functions";

export type DataSourceContext = {
  dataSources: {
    bftCloudFunctions: BFTCloudFunctions;
  };
};
