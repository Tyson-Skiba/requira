import { nanoid } from "nanoid";
import { LibGenEntry } from "../../models/books/lib-gen-entry";

const clearText = (text: string): string => {
  return text
    .split("\n")[0]!
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

export class LibGenBookProvider {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  isHiddenField = (fieldName: string): boolean => {
    return !["id"].includes(fieldName);
  };

  parseEntries = (
    document: Document,
    throwError?: (msg: string) => void,
  ): LibGenEntry[] => {
    const entries: LibGenEntry[] = [];
    const containerTable = document.querySelector("#tablelibgen > tbody");

    if (!containerTable) {
      if (throwError) {
        throwError("containerTable is undefined");
      }
      return [];
    }

    const entryElements = containerTable.children;

    for (let i = 0; i < entryElements.length; i++) {
      const element = entryElements[i] as HTMLElement;

      const authors = clearText(element.children[2]?.textContent || "")
        .split(";")
        .map((author) => author.trim())
        .join(", ");

      const titleSectionContent = Array.from(element.children[1]!.children)
        .filter((child) => child.nodeName !== "NOBR")
        .map((e) => e.textContent?.trim())
        .filter((e) => e)
        .join(" / ");

      const url = element.children[0]?.querySelector("a")?.href;

      const id = url
        ? new URL(url, process.env.BOOK_SOURCE_URL!).searchParams.get("id")!
        : "-1";

      const coverRel = element.children[0]?.querySelector("img")?.src;
      const cover = coverRel ? `${this.baseURL}${coverRel}` : "";
      const title = clearText(titleSectionContent || "");
      const publisher = clearText(element.children[3]?.textContent || "");
      const year = clearText(element.children[4]?.textContent || "");
      const pages = clearText(element.children[6]?.textContent || "");
      const language = clearText(element.children[5]?.textContent || "");
      const size = clearText(element.children[7]?.textContent || "");
      const extension = clearText(element.children[8]?.textContent || "");
      const mirror =
        element.children[9]
          ?.getElementsByTagName("a")?.[0]
          ?.getAttribute("href") || "";

      entries.push({
        id,
        authors,
        title,
        publisher,
        year,
        pages,
        language,
        size,
        extension,
        mirror,
        cover,
      });
    }

    return entries;
  };

  getPageURL = (pathname: string): string => {
    const url = new URL(pathname, this.baseURL);
    return url.toString();
  };

  getSearchURL = (
    query: string,
    pageNumber: number,
    pageSize: number,
  ): string => {
    const url = new URL("/index.php", this.baseURL);
    /* TODO: Make these options - lang is iso 639 */
    url.searchParams.set("req", `${query} lang:eng ext:epub`);
    url.searchParams.set("page", pageNumber.toString());
    url.searchParams.set("res", pageSize.toString());
    url.searchParams.set("gmode", "on");
    url.searchParams.set("covers", "on");
    return url.toString();
  };

  getDetailPageURL = (md5: string): string => {
    const url = new URL("/ads.php", this.baseURL);
    url.searchParams.set("md5", md5);
    return url.toString();
  };

  getMainDownloadURLFromDocument = (
    document: Document,
    throwError?: (msg: string) => void,
  ): string | null => {
    const downloadLinkElement = document.querySelector(
      "#main > tbody > tr:nth-child(1) > td:nth-child(2) > a",
    );

    if (!downloadLinkElement) {
      if (throwError) {
        throwError("downloadLinkElement is undefined");
      }
      return null;
    }

    const href = downloadLinkElement.getAttribute("href");
    return this.getPageURL(href || "");
  };

  formatField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "authors":
        return value
          .split(", ")
          .map((author) => author.trim())
          .join(", ");
      case "title":
        return value.trim();
      case "publisher":
      case "year":
      case "pages":
      case "language":
      case "size":
      case "extension":
        return value.trim();
      case "mirror":
        return value.startsWith("http") ? value : this.getPageURL(value);
      default:
        return value;
    }
  };
}
