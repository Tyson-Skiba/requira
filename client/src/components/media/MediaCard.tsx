import {
  Card,
  CardMedia,
  Typography,
  Box,
  CardContent,
  CardActions,
  Button,
  Chip,
  CardActionArea,
  Theme,
  SvgIconTypeMap,
  Paper,
  useTheme,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassCircleIcon,
  PlusCircleIcon,
  EnvelopeIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { JSX } from "react";

export interface MediaCardProps {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  aspectRatio?: string;
  isLoading?: boolean;
  status: "downloaded" | "failed" | "queued" | "none";
  onClick: () => void;
  openMenu?: (e: React.MouseEvent<HTMLElement>) => void;
}

interface IndicatorProps {
  status: MediaCardProps["status"];
}

interface Icon {
  height: number;
  color: string;
}

type IndicatorMap = {
  [P in IndicatorProps["status"]]: {
    colour: (theme: Theme) => string;
    label: string;
    Icon: React.ComponentType<Icon>;
  };
};

const indicators: IndicatorMap = {
  downloaded: {
    colour: (theme) => theme.palette.success.light,
    Icon: CheckCircleIcon,
    label: "saved",
  },
  failed: {
    colour: (theme) => theme.palette.error.main,
    Icon: ExclamationTriangleIcon,
    label: "failed",
  },
  queued: {
    colour: (theme) => theme.palette.primary.main,
    Icon: EnvelopeIcon,
    label: "queued",
  },
  none: {
    colour: (theme) => theme.palette.action.active,
    Icon: PlusCircleIcon,
    label: "download",
  },
};

const Icon: React.FC = () => {
  return (
    <Box position="absolute" top={4} right={8}>
      <Chip size="medium" label="Download" color="success" />
    </Box>
  );
};

export const MediaCard: React.FC<MediaCardProps> = ({
  title,
  subtitle,
  cover,
  status,
  isLoading,
  onClick,
  openMenu,
  aspectRatio = "2 / 3",
}) => {
  const theme = useTheme();
  const { colour, Icon } = indicators[status];
  const Container: any = openMenu ? Box : CardActionArea;
  return (
    <Card sx={{ height: "100%" }}>
      <Container
        sx={{ height: "100%" }}
        onClick={openMenu ? () => null : onClick}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box width="calc(100% - 4rem)">
              {isLoading ? (
                <Skeleton
                  animation="wave"
                  height={20}
                  width="80%"
                  style={{ marginBottom: 6, marginTop: 8 }}
                />
              ) : (
                <Typography variant="subtitle1" noWrap>
                  {title}
                </Typography>
              )}

              {isLoading ? (
                <Skeleton animation="wave" height={16} />
              ) : (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {subtitle}
                </Typography>
              )}
            </Box>

            {isLoading ? (
              <Skeleton
                animation="wave"
                variant="circular"
                width={24}
                height={24}
                sx={{ marginTop: "6px" }}
              />
            ) : (
              <Box>
                {openMenu ? (
                  <IconButton
                    onClick={openMenu}
                    sx={{ marginTop: "-0.5rem", marginRight: "-0.5rem" }}
                  >
                    <EllipsisVerticalIcon height={24} />
                  </IconButton>
                ) : (
                  <Icon height={24} color={colour(theme)} />
                )}
              </Box>
            )}
          </Box>
        </CardContent>
        {isLoading ? (
          <Skeleton
            sx={{
              aspectRatio,
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            animation="wave"
            variant="rectangular"
          />
        ) : (
          <CardMedia
            component="img"
            image={cover}
            sx={{
              aspectRatio,
              objectFit: "cover",
            }}
          />
        )}
      </Container>
    </Card>
  );
};
