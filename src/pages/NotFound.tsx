import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.acl;

  const handleGoHome = () => {
    navigate("/");
  };

  if (userRole === "sales") {
    return <Navigate to="/clients" replace />;
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        {t("404")}
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("page_not_found")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("ops_page_not_found")}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoHome}>
        {t("back_to_home")}
      </Button>
    </Box>
  );
};

export default NotFound;
