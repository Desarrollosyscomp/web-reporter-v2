export type TServiceResponse = {
  error?: boolean;
  data: any;
}
export type TPaginatedServiceResponse = {
  error?: boolean;
  data: [Array<any>, number, object?];
}