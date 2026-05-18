import React, { Suspense, useState, useEffect } from "react";
import {
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  Box,
  Button,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { lightTheme, darkTheme } from "@/theme/theme";
import LoadingSpinner from "./components/LoadingSpinner";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import CustomError from "./components/ui/CustomError";
import { setUser } from "@/redux/slices/authSlice";
import { routesConfig, RouteConfig } from "./routesConfig";

import ContactFloatingBar from "./components/ContactFloatingBar";
import PartnershipPreprocessor from "./components/PartnershipPreprocessor";
// add import
import { isRestrictedUser } from "@/utils/restrictions";


const MainLayout: React.FC<{
  darkMode: boolean;
  isSidebarExtended: boolean;
  toggleSidebar: () => void;
  handleThemeToggle: () => void;
  isMobile: boolean;
  onToggleExtended: (extended: boolean) => void;
}> = ({
  darkMode,
  isSidebarExtended,
  toggleSidebar,
  handleThemeToggle,
  isMobile,
  onToggleExtended,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.acl;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar
        isExtended={isSidebarExtended}
        onToggleExtended={onToggleExtended}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin-left 0.3s",
          marginLeft: isMobile
            ? "0 !important"
            : isSidebarExtended
            ? "242px"
            : "84px",
          width: isMobile
            ? "100vw"
            : `calc(100% - ${isSidebarExtended ? "242px" : "84px"})`,
          height: "100vh",
          overflowX: "hidden",
          backgroundColor: (theme) => theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          onThemeToggle={handleThemeToggle}
          darkMode={darkMode}
          onSidebarToggle={toggleSidebar}
        />
        <Box sx={{ flexGrow: 1, overflowY: "auto", pb: { xs: 8, md: 0 } }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {renderRoutes(routesConfig, userRole)}
              <Route
                path="*"
                element={
                  <ErrorBoundary
                    fallback={
                      <CustomError errorMessage="Page not found.">
                        <Button onClick={() => (window.location.href = "/")}>
                          Go Home
                        </Button>
                      </CustomError>
                    }
                  >
                    <NotFound />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

const renderRoutes = (routes: RouteConfig[], role?: string) => {
  const restricted = isRestrictedUser(); // ← NEW

  return routes
    .filter((r) => !r.roles || (role && r.roles.includes(role)))
    // ⬇️ hide ONLY the Admin Accounts menu (not the client /accounts)
    .filter(
      (r) =>
        !(
          restricted &&
          r.path === "/accounts" &&
          Array.isArray(r.roles) &&
          r.roles.includes("admin") // this route is the Admin AccountsMenu one
        )
    )
    .map((r) => {
      if (r.external) {
        return (
          <Route
            key={r.path}
            path={r.path}
            element={<Navigate to={r.external!} replace />}
          />
        );
      }

      if (r.children?.length) {
        const Parent = r.component!;
        return (
          <Route
            key={r.path}
            path={r.path}
            element={
              <ErrorBoundary
                fallback={
                  <CustomError errorMessage="Couldn’t load this section.">
                    <Button onClick={() => window.location.reload()}>
                      Reload
                    </Button>
                  </CustomError>
                }
              >
                <Parent />
              </ErrorBoundary>
            }
          >
            {renderRoutes(r.children, role)}
          </Route>
        );
      }

      const Leaf = r.component!;
      return (
        <Route
          key={r.path}
          path={r.path}
          element={
            <ErrorBoundary
              fallback={
                <CustomError errorMessage="Couldn’t load this page.">
                  <Button onClick={() => window.location.reload()}>
                    Reload
                  </Button>
                </CustomError>
              }
            >
              <Leaf />
            </ErrorBoundary>
          }
        />
      );
    });
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
  }, [user, dispatch]);

  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem("darkMode") === "true"
  );
  const isLargeScreen = useMediaQuery("(min-width:1340px)");
  const isMobile = useMediaQuery("(max-width:767px)");

  const [hasUserToggled, setHasUserToggled] = useState<boolean>(
    () => localStorage.getItem("hasUserToggled") === "true"
  );
  const [isSidebarExtended, setIsSidebarExtended] = useState<boolean>(() => {
    const saved = localStorage.getItem("isSidebarExtended");
    return saved !== null ? JSON.parse(saved) : isLargeScreen;
  });

  const handleThemeToggle = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", JSON.stringify(!prev));
      return !prev;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarExtended((prev) => {
      const next = !prev;
      localStorage.setItem("isSidebarExtended", JSON.stringify(next));
      return next;
    });
    setHasUserToggled(true);
    localStorage.setItem("hasUserToggled", "true");
  };

  const handleSidebarExtended = (extended: boolean) => {
    if (extended !== isSidebarExtended) {
      setIsSidebarExtended(extended);
      localStorage.setItem("isSidebarExtended", JSON.stringify(extended));
      setHasUserToggled(true);
      localStorage.setItem("hasUserToggled", "true");
    }
  };

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      if (!hasUserToggled) {
        const large = window.innerWidth >= 1340;
        setIsSidebarExtended(large);
        localStorage.setItem("isSidebarExtended", JSON.stringify(large));
      }
    };
    const debounced = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 150);
    };
    window.addEventListener("resize", debounced);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debounced);
    };
  }, [hasUserToggled]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <LanguageProvider>
          <Router>
            <PartnershipPreprocessor />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public (unprotected) */}
                {routesConfig
                  .filter((route) => route.hideInNav)
                  .map((route) => {
                    const C = route.component!;
                    return (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <ErrorBoundary>
                            <C />
                          </ErrorBoundary>
                        }
                      />
                    );
                  })}

                {/* Protected / main app */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary
                        fallback={
                          <CustomError errorMessage="App failed to load.">
                            <Button onClick={() => window.location.reload()}>
                              Reload App
                            </Button>
                          </CustomError>
                        }
                      >
                        <MainLayout
                          darkMode={darkMode}
                          isSidebarExtended={isSidebarExtended}
                          toggleSidebar={toggleSidebar}
                          handleThemeToggle={handleThemeToggle}
                          isMobile={isMobile}
                          onToggleExtended={handleSidebarExtended}
                        />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            <ContactFloatingBar />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
