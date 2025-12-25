import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { MetadataEditor } from "../metadata/MetadataEditor";
import { BaseDialog } from "./BaseDialog";

interface SelectedItem {
  id: number;
  title: string;
  type: "book" | "song";
}

interface MetadataDialogProps {
  fullScreen: boolean;
  open: boolean;
  selectedItem?: SelectedItem;
  onSave: () => void;
  onClose: () => void;
}

export const MetadataDialog: React.FC<MetadataDialogProps> = ({
  open,
  fullScreen,
  selectedItem,
  onClose,
  onSave,
}) => {
  return (
    <BaseDialog open={open} onClose={onClose} title="Edit Metadata">
      {open && selectedItem ? (
        <MetadataEditor
          type={selectedItem.type}
          id={selectedItem.id}
          onSave={onSave}
        />
      ) : null}
    </BaseDialog>
  );
};
