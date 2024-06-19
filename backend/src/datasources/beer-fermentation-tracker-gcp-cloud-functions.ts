import { RESTDataSource } from "@apollo/datasource-rest";
import { BatchModel, ReadingModel, ModifyDataResponseModel } from "../models";
import { BatchInput, BatchReadingInput } from "../types";

export class BFTCloudFunctions extends RESTDataSource {
  baseURL = process.env.CLOUD_FUNCTIONS_URL;
  
  async listBatches(): Promise<BatchModel[]> {
    const response = await this.get(`list_batches`);
    
    if (response) {
      const decoded = JSON.parse(response);
      
      return decoded;
    }
    
    return [];
    
    return response;
  }
  
  async getBatch(batchId: number): Promise<BatchModel> {
    const response = await this.post(`get_batch`, {
      body: {
        id: batchId
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return null;
  }
  
  async getBatchReadings(batchId: number): Promise<ReadingModel[]> {
    const response = await this.post(`get_batch_readings`, {
      body: {
        batch_id: batchId
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return [];
  }
  
  async newBatch(input: BatchInput): Promise<ModifyDataResponseModel> {
    const { name, target_gravity, original_gravity } = input;
  
    const response = await this.post(`new_batch`, {
      body: {
        name,
        target_gravity,
        original_gravity,
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return null;
  }
  
  async updateBatch(input: BatchInput): Promise<ModifyDataResponseModel> {
    const { id, name, target_gravity, original_gravity } = input;
  
    const response = await this.post(`update_batch`, {
      body: {
        id,
        name,
        target_gravity,
        original_gravity,
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return null;
  }
  
  async deleteBatch(batchID: number): Promise<ModifyDataResponseModel> {
    const response = await this.post(`delete_batch`, {
      body: {
        id: batchID
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return null;
  }
  
  async addBatchReading(input: BatchReadingInput): Promise<ModifyDataResponseModel> {
    const { batch_id, reading } = input;
  
    const response = await this.post(`add_batch_reading`, {
      body: {
        batch_id,
        reading,
      }
    });
    
    if (response) {
      return JSON.parse(response);
    }
    
    return null;
  }
}
