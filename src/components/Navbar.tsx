import React from "react";
import {
  IconButton,
  MenuItem,
  Menu,
  Box,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { Language } from "../types"; // Import Language type
import { useLocation } from "react-router-dom"; // Import useLocation hook
import { routesConfig } from "../routesConfig"; // Import route-to-title mapping
import { useTheme } from "@mui/material/styles";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

interface NavbarProps {
  onThemeToggle: () => void;
  darkMode: boolean;
  onSidebarToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onThemeToggle,
  darkMode,
  onSidebarToggle,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const location = useLocation(); // Get current location
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:767px)"); // Detect mobile

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    handleMenuClose();
  };

  // Function to get the title key based on current path
  const getTitleKey = (): string => {
    const sortedRoutes = [...routesConfig].sort(
      (a, b) => b.path.length - a.path.length
    );
    const matchedRoute = sortedRoutes.find((route) =>
      location.pathname.startsWith(route.path)
    );
    return matchedRoute ? matchedRoute.titleKey : "dashboard";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Button to toggle the sidebar */}
        {!isMobile && (
          <Button
            onClick={onSidebarToggle}
            sx={{ color: theme.palette.text.primary }}
          >
            <i className="la la-bars"></i>
          </Button>
        )}

        {/* Dynamic Title */}
        <Typography variant="h6" color={theme.palette.text.primary}>
          {t(getTitleKey())}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Dark Mode Toggle */}

        <IconButton
          onClick={onThemeToggle}
          aria-label="Toggle theme"
          className="relative"
        >
          {!darkMode ? <WbSunnyOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        {/* Language Selector */}
        <IconButton
          onClick={handleMenuOpen}
          color="inherit"
          aria-label={t("select_language")}
        >
          <i className="la la-globe"></i>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            selected={language === "en"}
            onClick={() => handleLanguageChange("en")}
          >
            English
          </MenuItem>
          <MenuItem
            selected={language === "ar"}
            onClick={() => handleLanguageChange("ar")}
          >
            العربية
          </MenuItem>
          {/* Add more languages as needed */}
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;
