import { GraphQLResolveInfo } from 'graphql';
import { BatchModel, ReadingModel, ModifyDataResponseModel } from './models';
import { DataSourceContext } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** A beer batch */
export type Batch = {
  __typename?: 'Batch';
  /** The ID for the batch. */
  id: Scalars['Int']['output'];
  /** The name of the batch. */
  name: Scalars['String']['output'];
  /** The original gravity of the batch. */
  original_gravity: Scalars['Float']['output'];
  /** The gravity readings of the batch. */
  readings?: Maybe<Array<Maybe<Reading>>>;
  /** The batch's target gravity. */
  target_gravity: Scalars['Float']['output'];
};

/** The input for adding a new batch */
export type BatchInput = {
  /** The ID of the batch */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the batch */
  name: Scalars['String']['input'];
  /** The original gravity */
  original_gravity: Scalars['Float']['input'];
  /** The target gravity */
  target_gravity: Scalars['Float']['input'];
};

/** The input for adding a new reading to a batch */
export type BatchReadingInput = {
  /** The id of the batch to add the reading for */
  batch_id: Scalars['Int']['input'];
  /** The new gravity reading */
  reading: Scalars['Float']['input'];
};

/** The response of a data modification request */
export type ModifyDataResponse = {
  __typename?: 'ModifyDataResponse';
  /** The return code */
  code?: Maybe<Scalars['Int']['output']>;
  /** The error message given, if any */
  error?: Maybe<Scalars['String']['output']>;
  /** Whether or not the operation was successful */
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Adds a new gravity reading to a batch */
  addBatchReading: ModifyDataResponse;
  /** Deletes a batch */
  deleteBatch: ModifyDataResponse;
  /** Adds a new batch */
  newBatch: ModifyDataResponse;
  /** Updates a batch */
  updateBatch: ModifyDataResponse;
};


export type MutationAddBatchReadingArgs = {
  input: BatchReadingInput;
};


export type MutationDeleteBatchArgs = {
  id: Scalars['Int']['input'];
};


export type MutationNewBatchArgs = {
  input: BatchInput;
};


export type MutationUpdateBatchArgs = {
  input: BatchInput;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieves a specific batch */
  batch?: Maybe<Batch>;
  /** Lists all batches */
  listBatches: Array<Batch>;
};


export type QueryBatchArgs = {
  id: Scalars['Int']['input'];
};

/** A single gravity reading of a batch */
export type Reading = {
  __typename?: 'Reading';
  /** The ID of the batch the reading belongs to. */
  batch_id: Scalars['Int']['output'];
  /** The gravity reading */
  reading: Scalars['Float']['output'];
  /** The timestamp of the reading. */
  tstamp?: Maybe<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Batch: ResolverTypeWrapper<BatchModel>;
  BatchInput: BatchInput;
  BatchReadingInput: BatchReadingInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  ModifyDataResponse: ResolverTypeWrapper<ModifyDataResponseModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Reading: ResolverTypeWrapper<ReadingModel>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Batch: BatchModel;
  BatchInput: BatchInput;
  BatchReadingInput: BatchReadingInput;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  Int: Scalars['Int']['output'];
  ModifyDataResponse: ModifyDataResponseModel;
  Mutation: {};
  Query: {};
  Reading: ReadingModel;
  String: Scalars['String']['output'];
};

export type BatchResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Batch'] = ResolversParentTypes['Batch']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  original_gravity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  readings?: Resolver<Maybe<Array<Maybe<ResolversTypes['Reading']>>>, ParentType, ContextType>;
  target_gravity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ModifyDataResponseResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['ModifyDataResponse'] = ResolversParentTypes['ModifyDataResponse']> = {
  code?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBatchReading?: Resolver<ResolversTypes['ModifyDataResponse'], ParentType, ContextType, RequireFields<MutationAddBatchReadingArgs, 'input'>>;
  deleteBatch?: Resolver<ResolversTypes['ModifyDataResponse'], ParentType, ContextType, RequireFields<MutationDeleteBatchArgs, 'id'>>;
  newBatch?: Resolver<ResolversTypes['ModifyDataResponse'], ParentType, ContextType, RequireFields<MutationNewBatchArgs, 'input'>>;
  updateBatch?: Resolver<ResolversTypes['ModifyDataResponse'], ParentType, ContextType, RequireFields<MutationUpdateBatchArgs, 'input'>>;
};

export type QueryResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  batch?: Resolver<Maybe<ResolversTypes['Batch']>, ParentType, ContextType, RequireFields<QueryBatchArgs, 'id'>>;
  listBatches?: Resolver<Array<ResolversTypes['Batch']>, ParentType, ContextType>;
};

export type ReadingResolvers<ContextType = DataSourceContext, ParentType extends ResolversParentTypes['Reading'] = ResolversParentTypes['Reading']> = {
  batch_id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reading?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  tstamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = DataSourceContext> = {
  Batch?: BatchResolvers<ContextType>;
  ModifyDataResponse?: ModifyDataResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reading?: ReadingResolvers<ContextType>;
};

