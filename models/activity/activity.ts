import { ActivityType } from "./activity-type";

export interface Activity {
  id: number;
  triggeredByUserId: number;
  type: ActivityType;
  details: string;
  entityId?: number;
  entityType?: string;
}
