import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  JSX,
} from "react";
import { useSnackbar, VariantType } from "notistack";
import { usersApi } from "../api/users";
import { Activity } from "../../../models/activity/activity";
import { ActivityType } from "../../../models/activity/activity-type";
import { Alert, AlertProps, Box, Paper } from "@mui/material";

interface ActivityContextValue {
  unseen: number;
  activities: Activity[];
  loadMore: () => Promise<void>;
  setViewed: () => void;
  parseActivity: (activity: Activity) => JSX.Element;
}

type ToastMap = {
  [P in ActivityType]: VariantType;
};

type SeverityMap = {
  [P in ActivityType]: AlertProps["severity"];
};

const ActivityContext = createContext<ActivityContextValue | undefined>(
  undefined,
);

const toastMap: ToastMap = {
  add_to_queue: "info",
  failed_to_download: "error",
  download_succeeded: "success",
  request_approved: "info",
  item_updated: "info",
};

const activityTypeToSeverity: SeverityMap = {
  add_to_queue: "info",
  failed_to_download: "error",
  download_succeeded: "success",
  request_approved: "info",
  item_updated: "info",
};

const parseActivity = (activity: Activity, outline?: boolean) => {
  // TODO: Deep link etc
  return (
    <Alert
      severity={activityTypeToSeverity[activity.type]}
      id={activity.id.toString()}
      key={activity.id.toString()}
      variant={outline === true ? "filled" : "standard"}
    >
      {activity.details}
    </Alert>
  );
};

export const ActivityProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cursor, setCursor] = useState<number>();
  const [lastViewedId, setLastViewedId] = useState(0);
  const seenIds = useRef<Set<number>>(new Set());

  const fetchNewActivities = async (initial: boolean) => {
    const { items, nextCursor } = await usersApi.getActivities();
    const newItems = items.filter((a) => !seenIds.current.has(a.id));
    if (newItems.length === 0) return;

    newItems.forEach((a) => seenIds.current.add(a.id));
    setActivities((prev) => [...newItems, ...prev]);

    if (initial) return;

    newItems.forEach((a) =>
      enqueueSnackbar(parseActivity(a, true), {
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
        content: (key, message) => (
          <Box
            key={key}
            style={{
              padding: 0,
              margin: 0,
            }}
          >
            {message}
          </Box>
        ),
      }),
    );
  };

  const loadMoreActivities = async () => {
    if (!cursor) return;
    const { items, nextCursor } = await usersApi.getActivities(cursor);
    const olderItems = items.filter((a) => !seenIds.current.has(a.id));
    if (olderItems.length === 0) return;

    olderItems.forEach((a) => seenIds.current.add(a.id));
    setActivities((prev) => [...prev, ...olderItems]);
    setCursor(nextCursor);
  };

  useEffect(() => {
    fetchNewActivities(true);
    const id = setInterval(fetchNewActivities, 30000);
    return () => clearInterval(id);
  }, []);

  const unseen = activities.filter((a) => a.id > lastViewedId).length;

  return (
    <ActivityContext.Provider
      value={{
        activities,
        unseen,
        parseActivity,
        loadMore: loadMoreActivities,
        setViewed: () =>
          setLastViewedId(Math.max(0, ...activities.map((a) => a.id))),
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivities must be used within an ActivityProvider");
  }
  return context;
};
