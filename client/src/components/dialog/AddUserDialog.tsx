import {
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Box,
} from "@mui/material";
import { BaseDialog } from "./BaseDialog";
import { useEffect, useState } from "react";
import { User } from "../../../../models/users/user";
import { useAuth } from "../../context/AuthContext";

type EditableUserParts = Omit<User, "id" | "theme" | "isAdmin"> & {
  password: string;
};

interface AddUserDialogProps {
  open: boolean;
  user?: User;
  onSave: (user: EditableUserParts) => void;
  onClose: () => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
}) => {
  const { user: currentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isApprover, setIsApprover] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [canSeeFullLibrary, setCanSeeFullLibrary] = useState(false);

  const reset = (user?: User) => {
    setUsername(user?.username ?? "");
    setPassword("");
    setIsApprover(user?.isApprover ?? false);
    setRequiresApproval(user?.requiresApproval ?? true);
    setCanSeeFullLibrary(user?.canSeeFullLibrary ?? false);
  };

  useEffect(() => {
    reset(user);
  }, [user]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    onSave({
      username,
      password,
      isApprover,
      requiresApproval,
      canSeeFullLibrary,
    });
    reset();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={!user ? "Create User" : "Edit User"}
    >
      <Stack spacing={2} sx={{ mt: 1, minWidth: 350 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
        />

        {!user && (
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
        )}

        <FormControlLabel
          control={
            <Switch
              checked={isApprover}
              onChange={(e) => setIsApprover(e.target.checked)}
            />
          }
          label="Approver"
        />

        <FormControlLabel
          control={
            <Switch
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
            />
          }
          label="Requires Approval"
        />

        <FormControlLabel
          control={
            <Switch
              checked={canSeeFullLibrary}
              onChange={(e) => setCanSeeFullLibrary(e.target.checked)}
              disabled={requiresApproval}
            />
          }
          label="Full Library Access"
        />

        {currentUser.isAdmin ? (
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button variant="contained" onClick={handleSubmit}>
              {!user ? "Add User" : "Save Changes"}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </BaseDialog>
  );
};
