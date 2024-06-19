// Represents a batch model returned from the API
export type BatchModel = {
  id: number;
  name: string;
  target_gravity: number;
  original_gravity: number;
  readings: ReadingModel[];
};

export type ReadingModel = {
  batch_id: number;
  reading: number;
  tstamp: string;
};

export type ModifyDataResponseModel = {
  code?: number;
  success: boolean;
  error?: string;
}
