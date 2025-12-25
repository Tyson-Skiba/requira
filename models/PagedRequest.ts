export interface PagedRequest<T> {
  items: T[];
  nextCursor?: number;
}
