import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { Language } from "../types";
import {
  Toolbar,
  Box,
  Typography,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom"; // ⬅️ useLocation added
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LiveChatModal from "@/components/LiveChatModal";

const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

const HomeHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation(); // ⬅️ current route

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openChat, setOpenChat] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  // detect if current page is partner_register
  const isPartnerRegisterPage = location.pathname === "/partner_register";

  useEffect(() => {
    let cancelled = false;

    const setChatVisibility = (countryCode: string | null) => {
      const code = countryCode?.toUpperCase() ?? "";
      setShowLiveChat(EU_COUNTRY_CODES.has(code));
    };

    const cachedCountry = localStorage.getItem("geoCountry");
    if (cachedCountry) {
      setChatVisibility(cachedCountry);
      return;
    }

    fetch("https://ipapi.co/json/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;

        const countryCode = data?.country_code;
        if (countryCode) {
          localStorage.setItem("geoCountry", String(countryCode).toUpperCase());
        }
        setChatVisibility(countryCode);
      })
      .catch(() => {
        if (!cancelled) setChatVisibility(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLangMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    handleLangMenuClose();
  };

  const headerBtnSx = {
    minHeight: 40,
    px: 2.5,
    fontSize: 12,
    lineHeight: 1.2,
  };

  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          mt: 2,
          paddingLeft: "0 !important",
          "@media (min-width:1340px)": {
            paddingLeft: "0 !important",
          },
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left: Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/images/logo.png"
              alt="FxGrow Logo"
              style={{ height: 80, marginRight: 8 }}
            />
          </Box>
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                startIcon={
                  <i className={`la la-phone`} style={{ fontSize: 20 }} />
                }
                variant="outlined"
                sx={{ ...headerBtnSx, borderColor: "#8181A5" }}
              >
                {t("header_phone_number")}
              </Button>
              {showLiveChat && (
                <Button
                  startIcon={
                    <i className={`la la-comments`} style={{ fontSize: 20 }} />
                  }
                  variant="outlined"
                  sx={{ ...headerBtnSx, borderColor: "#8181A5" }}
                  onClick={() => setOpenChat(true)}
                >
                  {t("header_live_chat")}
                </Button>
              )}

              {/* Become a partner / Register button */}
              <Button
                variant="contained"
                sx={{ ...headerBtnSx, color: "#fff" }}
                onClick={() =>
                  navigate(
                    isPartnerRegisterPage ? "/register" : "/partner_register"
                  )
                }
              >
                {isPartnerRegisterPage
                  ? t("register_now") // or t("header_register") if you have that key
                  : t("header_become_partner")}
              </Button>

              {/* Language Picker */}
              <Box>
                <IconButton onClick={handleLangMenuOpen}>
                  <Box
                    component="img"
                    src={`/images/v1/flags/${language}.png`}
                    sx={{ width: 24, height: "auto" }}
                  />
                  <ArrowDropDownIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleLangMenuClose}
                >
                  <MenuItem
                    selected={language === "en"}
                    onClick={() => handleLanguageChange("en")}
                  >
                    <img
                      src="/images/v1/flags/en.png"
                      alt="en"
                      width="24"
                      style={{ marginRight: 8 }}
                    />
                    {t("english")}
                  </MenuItem>
                  <MenuItem
                    selected={language === "ar"}
                    onClick={() => handleLanguageChange("ar")}
                  >
                    <img
                      src="/images/v1/flags/ar.png"
                      alt="ar"
                      width="24"
                      style={{ marginRight: 8 }}
                    />
                    {t("arabic")}
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )}

          {isMobile && (
            <Box sx={{ display: "flex", alignItems: "right", gap: 1 }}>
              <Box>
                <IconButton onClick={handleLangMenuOpen}>
                  <Box
                    component="img"
                    src={`/images/v1/flags/${language}.png`}
                    sx={{ width: 32, height: "auto" }}
                  />
                  <ArrowDropDownIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleLangMenuClose}
                >
                  <MenuItem
                    selected={language === "en"}
                    onClick={() => handleLanguageChange("en")}
                  >
                    <img
                      src="/images/v1/flags/en.png"
                      alt="en"
                      width="32"
                      style={{ marginRight: 8 }}
                    />
                    {t("english")}
                  </MenuItem>
                  <MenuItem
                    selected={language === "ar"}
                    onClick={() => handleLanguageChange("ar")}
                  >
                    <img
                      src="/images/v1/flags/ar.png"
                      alt="ar"
                      width="32"
                      style={{ marginRight: 8 }}
                    />
                    {t("arabic")}
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </Toolbar>
      </Container>

      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            right: 0,
            top: "25%",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            gap: 1,
          }}
        >
          {showLiveChat && (
            <Box
              sx={{
                width: 76,
                transform: "rotate(-90deg)",
                bgcolor: "#ee222b",
                color: "white",
                textAlign: "center",
                borderRadius: "8px 8px 0 0",
                boxShadow: "0 0 4px rgba(0,0,0,0.8)",
                mb: 3,
                cursor: "pointer",
              }}
              onClick={() => setOpenChat(true)}
            >
              <Typography variant="caption" sx={{ display: "block", py: 1 }}>
                {t("header_live_chat")}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              width: 76,
              transform: "rotate(-90deg)",
              bgcolor: "#21a538",
              color: "white",
              textAlign: "center",
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 0 4px rgba(0,0,0,0.8)",
              mt: 3,
              cursor: "pointer",
            }}
          >
            <Typography variant="caption" sx={{ display: "block", py: 1 }}>
              {t("header_call_back")}
            </Typography>
          </Box>
        </Box>
      )}

      <LiveChatModal open={openChat} onClose={() => setOpenChat(false)} />
    </>
  );
};

export default HomeHeader;
