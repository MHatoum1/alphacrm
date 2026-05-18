// src/pages/Admin/ProfilesReview/ReviewMenu.tsx
import {
  useParams,
  NavLink,
  Outlet,
  useNavigate,
  useMatch,
} from "react-router-dom";
import {
  Tabs,
  Tab,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadProfile } from "@/redux/slices/adminProfileReviewSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { useTranslation } from "react-i18next";

export default function ReviewMenu() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tabMatch = useMatch("/detailed/review/:id/:tab");
  const active = tabMatch?.params.tab || "personal";

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (id) dispatch(loadProfile(id));
  }, [id, dispatch]);

  const profile = useSelector((s: RootState) => s.profileReview.data);
  const isAffiliate = Boolean(profile.affiliate);
  const user = useSelector((s: RootState) => s.auth.user);
  const adminEmail = user.email;

  const baseTabs = [
    "personal",
    "employment",
    "trading",
    "agreements",
    "documents",
  ];
  const extraTabs = isAffiliate
    ? ["ib_details"]
    : [
        "mh+admin@equitick.com",
        "info+cy@fxgrow.com",
        "ademetriou+cy@fxgrow.com",
        "nmikati+1@fxgrow.com",
        "mahdim@fxgrow.com"
      ].includes(adminEmail || "")
    ? ["risk_assessment", "cdd"]
    : [];
  const tabs = [...baseTabs, ...extraTabs];

  // Redirect to first tab if none in URL
  useEffect(() => {
    if (!tabMatch && id) {
      navigate(`/detailed/review/${id}/${tabs[0]}`, { replace: true });
    }
  }, [tabMatch, navigate, tabs, id]);

  // Responsive switch
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const makeTab = (key: string) => (
    <Tab
      key={key}
      value={key}
      label={t(key)}
      component={NavLink}
      to={`/detailed/review/${id}/${key}`}
    />
  );
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {isMobile ? (
        <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
          <InputLabel id="review-menu-select-label">
            {t("select_tab")}
          </InputLabel>
          <Select
            labelId="review-menu-select-label"
            value={active}
            label={t("select_tab")}
            onChange={(e) =>
              navigate(`/detailed/review/${id}/${e.target.value}`)
            }
          >
            {tabs.map((key) => (
              <MenuItem key={key} value={key}>
                {t(key)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Tabs
            value={active}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map(makeTab)}
          </Tabs>
        </Paper>
      )}

      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
