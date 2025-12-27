export type ActivityType =
  | "add_to_queue"
  | "failed_to_download"
  | "download_succeeded"
  | "request_approved"
  | "item_updated";

export const queueActivityType: ActivityType = "add_to_queue";
export const downloadSuccessActivityType: ActivityType = "download_succeeded";
export const failedDownloadActivityType: ActivityType = "failed_to_download";
