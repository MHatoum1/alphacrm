// src/pages/User/Partners/PartnerReferralsTab.tsx
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchReferrals } from "@/redux/slices/partnerReferralsSlice";
import { useTranslation } from "react-i18next";

export default function PartnerReferralsTab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { rows, status } = useAppSelector((s) => s.partnerReferrals);
  const uid = JSON.parse(localStorage.getItem("user") || "{}").userID as string;
  const theme = useTheme();

  useEffect(() => {
    if (uid) dispatch(fetchReferrals({ user_id: uid, page: 1, perPage: 100 }));
  }, [dispatch, uid]);

  const renderStyledCell = (rawValue: any) => {
    const temp = document.createElement("div");
    temp.innerHTML = rawValue;
    const text = (temp.textContent || temp.innerText || "").toUpperCase();
    const textStyle = text.toLowerCase().replace(/\s+/g, "_");
    const backgroundColor =
      theme.palette.status[textStyle]?.bg || theme.palette.status.default.bg;
    const textColor =
      theme.palette.status[textStyle]?.color || theme.palette.status.default.color;

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
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: t("name"), flex: 1 },
    { field: "country", headerName: t("country"), flex: 1 },
    { field: "email", headerName: t("email"), flex: 1 },
    { field: "phone", headerName: t("phone"), flex: 1 },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => renderStyledCell(params.value),
    },
    {
      field: "deposited",
      headerName: t("deposited"),
      flex: 1,
      renderCell: (params) => renderStyledCell(params.value),
    },
    { field: "accounts", headerName: t("accounts"), flex: 1 },
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
        {t("list_of_referrals")}
      </Typography>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows.map((r, i) => ({ ...r, id: i }))}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 100, page: 0 },
            },
          }}
          pageSizeOptions={[100]}
          pagination
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}
