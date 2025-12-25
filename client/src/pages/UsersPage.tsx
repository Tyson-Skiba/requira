import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { AddUserDialog } from "../components/dialog/AddUserDialog";
import { BaseDialog } from "../components/dialog/BaseDialog";
import { usersApi } from "../api/users";
import { User } from "../../../models/users/user";

const getUser = (userId: number | undefined, users: User[]) => {
  if (!userId || userId === -1) return undefined;
  return users.find(({ id }) => id === userId);
};

export const UserManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState<number | undefined>();
  const [deleteContext, setDeleteContext] = useState<number | undefined>();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<number | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: number,
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUserId(null);
  };

  const loadUsers = async () => {
    setLoading(true);
    const users = await usersApi.getAll();
    setUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleResetPassword = async (id: number) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    await usersApi.resetPassword(id, newPassword);

    alert("Password reset successfully.");
  };

  return (
    <DashboardLayout>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {!isMobile && <TableCell>Username</TableCell>}
              <TableCell align="center">Approver</TableCell>
              <TableCell align="center">Needs Approval</TableCell>
              <TableCell align="center">Full Library</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={user.id}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <TableCell
                  sx={
                    isMobile
                      ? {
                          paddingRight: 0,
                          paddingLeft: "0.5rem",
                        }
                      : undefined
                  }
                >
                  <Avatar src={user.avatar}>{user.username[0]}</Avatar>
                </TableCell>
                {!isMobile && <TableCell>{user.username}</TableCell>}
                <TableCell align="center">
                  {user.isApprover ? (
                    <CheckIcon width={20} height={20} />
                  ) : null}
                </TableCell>
                <TableCell align="center">
                  {user.requiresApproval ? (
                    <CheckIcon width={20} height={20} />
                  ) : null}
                </TableCell>
                <TableCell align="center">
                  {user.canSeeFullLibrary ? (
                    <CheckIcon width={20} height={20} />
                  ) : null}
                </TableCell>
                <TableCell align="right">
                  {isMobile ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user.id)}
                        disabled={user.isAdmin}
                      >
                        <EllipsisVerticalIcon width={28} height={28} />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor}
                        open={menuUserId === user.id && Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            setUserContext(user.id);
                            handleMenuClose();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={async () => {
                            setDeleteContext(user.id);
                            handleMenuClose();
                          }}
                        >
                          Delete
                        </MenuItem>
                        <MenuItem
                          onClick={async () => {
                            await handleResetPassword(user.id);
                            handleMenuClose();
                          }}
                        >
                          Reset Password
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setUserContext(user.id)}
                          disabled={user.isAdmin}
                        >
                          <PencilIcon width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteContext(user.id)}
                          disabled={user.isAdmin}
                        >
                          <TrashIcon width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton
                          size="small"
                          onClick={() => handleResetPassword(user.id)}
                          disabled={user.isAdmin}
                        >
                          <ArrowPathIcon width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow
              sx={{
                borderTop: (theme) => `2px solid ${theme.palette.action.hover}`,
              }}
            >
              <TableCell align="right" colSpan={6}>
                <Button
                  variant="contained"
                  onClick={() => setUserContext(-1)}
                  sx={{ width: isMobile ? "100%" : "auto" }}
                >
                  Add User
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <AddUserDialog
        user={getUser(userContext, users)}
        open={!!userContext}
        onClose={() => setUserContext(undefined)}
        onSave={async (user) => {
          if (userContext === -1) await usersApi.create(user);
          else await usersApi.update(userContext!, user);

          setUserContext(undefined);
          loadUsers();
        }}
      />
      <BaseDialog
        title="Warning"
        open={!!deleteContext}
        onClose={() => setDeleteContext(undefined)}
      >
        <Typography>
          Are you sure you want to delete this user, this action cannot be
          undone. This is your last chance before data is removed.
        </Typography>
        <Button
          color="error"
          onClick={async () => {
            if (deleteContext) await usersApi.remove(deleteContext);
            setDeleteContext(undefined);
            loadUsers();
          }}
        >
          Yes i want to permanently remove this account
        </Button>
      </BaseDialog>
    </DashboardLayout>
  );
};
