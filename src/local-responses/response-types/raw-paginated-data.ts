export type TRawPaginatedData<T = any, S = any> = {
  list: T[];
  count: number;
  summary?: S;
};
