// src/pages/User/Partners/PartnerReferralsByAccountTab.tsx
import { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchReferralAccounts } from "@/redux/slices/partnerReferralAccountsSlice";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function PartnerReferralsByAccountTab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rows, status } = useAppSelector((s) => s.partnerReferralAccounts);
  const user_id = JSON.parse(localStorage.getItem("user") || "{}").userID;
  const theme = useTheme();
  useEffect(() => {
    if (user_id) {
      dispatch(fetchReferralAccounts({ user_id }));
    }
  }, [dispatch, user_id]);

  const columns: GridColDef[] = [
    { field: "login", headerName: t("login"), flex: 1 },
    { field: "type", headerName: t("type"), flex: 1 },
    { field: "currency", headerName: t("currency"), flex: 1 },
    { field: "created", headerName: t("created"), flex: 1 },
    {
      field: "volume",
      headerName: t("volume"),
      flex: 1,
      renderCell: (p: GridRenderCellParams) =>
        p.value != null ? p.value : "N/A",
    },
    {
      field: "balance",
      headerName: t("balance"),
      flex: 1,
      renderCell: (p: GridRenderCellParams) =>
        p.value != null ? p.value : "N/A",
    },
    { field: "leverage", headerName: t("leverage"), flex: 1 },
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => {
        const temp = document.createElement("div");
        temp.innerHTML = params.value;
        const text = (temp.textContent || temp.innerText || "").toUpperCase();
        const textStyle = text.toLowerCase().replace(/\s+/g, "_");
        const backgroundColor =
          theme.palette.status[textStyle]?.bg ||
          theme.palette.status.default.bg;
        const textColor =
          theme.palette.status[textStyle]?.color ||
          theme.palette.status.default.color;
        return (
          <Box
            sx={{
              backgroundColor,
              color: textColor,
              borderRadius: "8px",
              padding: "4px 8px",
              textAlign: "center",
              minWidth: "90px",
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {text}
            </Typography>
          </Box>
        );
      },
    },
  ];

  if (status === "loading") {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("Referrals — Accounts View")}
      </Typography>
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows.map((r, i) => ({ id: i, ...r }))}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50, page: 0 } },
          }}
          pagination
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}
