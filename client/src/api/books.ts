import { Book } from "../../../models/books/book";
import { LibGenEntry } from "../../../models/books/lib-gen-entry";
import { PagedRequest } from "../../../models/PagedRequest";

const search = async (term: string): Promise<LibGenEntry[]> => {
  const request = await fetch(
    `/api/books/search?term=${encodeURIComponent(term)}`,
  );
  const json = await request.json();

  return json;
};

const queue = async (params: URLSearchParams) => {
  const request = await fetch(`/api/books/queue?${params.toString()}`, {
    method: "PUT",
  });
  return await request.json();
};

const find = async (cursor?: number, searchTerm?: string) => {
  const request = await fetch(
    `/api/books/?cursor=${cursor}&searchTerm=${searchTerm}`,
  );
  return (await request.json()) as PagedRequest<Book>;
};

export const bookApi = {
  search,
  find,
  queue,
};
