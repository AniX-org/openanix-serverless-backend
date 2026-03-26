interface ResponseBase {
  code: number;
}

export interface ErrorResponse extends ResponseBase {
  message: string;
  description: null | string;
}

export interface SuccessResponse<T> extends ResponseBase {
  data: T;
}
