// src/components/Sidebar.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { RouteConfig, routesConfig } from "@/routesConfig";
import logo from "../assets/images/alpha-trust-website-favicon-color.svg";
import logo_full from "../assets/images/alpha-trust-logo.png";
import { isRestrictedUser } from "@/utils/restrictions";

// src/components/Sidebar.tsx
interface SidebarProps {
  /** whether the sidebar is currently extended or collapsed */
  isExtended: boolean;
  /** call this with `true` to force the sidebar open */
  onToggleExtended: (extended: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isExtended, onToggleExtended }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:767px)");
  const user = useSelector((state: RootState) => state.auth.user);

  const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>(
    {}
  );

  const isLargeDesktop = useMediaQuery("(min-width:1340px)");

  useEffect(() => {
    // force collapsed below 1340, extended at/above 1340
    onToggleExtended(isLargeDesktop);

    if (!isLargeDesktop) {
      setOpenSubmenus({});
      setIsSecondaryVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLargeDesktop]);

  const clientProfile = useSelector((s: RootState) => s.clientProfile.data);

  // still in Sidebar.tsx, below the selector…
  const allowedClientTabs = useMemo<string[]>(() => {
    if (!clientProfile.id) return [];
    const verified = !!clientProfile.verified;
    const firstTab = clientProfile.activated ? "overview" : "activatepage";

    const common = [firstTab];
    const passwordTab = "password";

    if (verified) {
      return [...common, "agreements", "documents", passwordTab];
    } else {
      return [
        ...common,
        "personal",
        "employment",
        "trading",
        "documents",
        passwordTab,
      ];
    }
  }, [clientProfile]);

  // Reset on collapse
  useEffect(() => {
    if (!isExtended) {
      setOpenSubmenus({});
      setIsSecondaryVisible(false);
    }
  }, [isExtended]);

  // Scroll hide primary nav
  useEffect(() => {
    let prevY = window.scrollY;
    const onScroll = () => {
      const currY = window.scrollY;
      const anyOpen = Object.values(openSubmenus).some(Boolean);
      setIsNavHidden(!anyOpen && currY > prevY);
      prevY = currY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [openSubmenus]);
  
  const restricted = isRestrictedUser();

  // Filter top-level routes + only visible children
// desktop / primary list source
const navItems = routesConfig
  .filter(
    (r) =>
      !r.hideInNav &&
      r.icon &&
      (!r.affiliateOnly || (user && user.affiliate === 1)) &&
      (!r.roles || (user && r.roles.includes(user.acl))) &&
      typeof r.tab === "undefined"
  )
  // ⬇️ hide Admin Accounts menu if restricted
  .filter(
    (r) =>
      !(
        restricted &&
        r.path === "/accounts" &&
        Array.isArray(r.roles) &&
        r.roles.includes("admin")
      )
  )
  .map((r) => {
    if (r.path === "/userprofile" && r.children) {
      const kids = r.children.filter(
        (c) => !c.hideInNav && c.tab && allowedClientTabs.includes(c.tab)
      );
      return { ...r, children: kids };
    }
    if (r.children) {
      const kids = r.children.filter((c) => !c.hideInNav && c.tab);
      return { ...r, children: kids };
    }
    return r;
  });

// mobile source
const navItemsMobile = routesConfig
  .filter(
    (route: RouteConfig) =>
      route.icon &&
      (!route.affiliateOnly || (user && user.affiliate === 1)) &&
      (!route.roles || (user && route.roles.includes(user.acl))) &&
      typeof route.tab === "undefined"
  )
  // ⬇️ hide Admin Accounts menu if restricted
  .filter(
    (r) =>
      !(
        restricted &&
        r.path === "/accounts" &&
        Array.isArray(r.roles) &&
        r.roles.includes("admin")
      )
  )
  .map((route) =>
    route.children
      ? {
          ...route,
          children: route.children.filter((child) => child.tab),
        }
      : route
  );


  // Mobile‐only “always” list
  const role = user?.acl;
  const mobileAlways =
    role === "secure"
      ? ["/", "/userprofile", "/accounts", "/deposit", "/withdraw"]
      : role === "admin" || role === "head_of_sales"
      ? ["/", "/profiles", "/deposits", "/withdrawals"]
      : role === "sales"
      ? ["/", "/clients", "/leads", "/demo"]
      : [];

  // Primary: on mobile only your “always” list; on desktop always show all top-levels
  const primaryItems = isMobile
    ? navItemsMobile.filter((it) => mobileAlways.includes(it.path))
    : navItems;

  // Toggle submenu open/close
  const toggleSubmenu = (path: string) =>
    setOpenSubmenus((prev) => ({ [path]: !prev[path] }));

  // Renders desktop & mobile primary items
  const renderNavItem = (item: RouteConfig) => {
    if (item.external) {
      return (
        <div key={item.path} className="nav__item">
          <a
            className="nav__link"
            href={item.external}
            target="_blank"
            rel="noopener noreferrer"
            title={t(item.titleKey)}
            style={{
              color: theme.palette.mode === "dark" ? "#A0A0A0" : "#8181A5",
              fontWeight: "normal",
              borderRadius: "6px",
            }}
            onClick={() => {
              /* close any open submenu */
              setOpenSubmenus({});
            }}
          >
            <div className="nav__preview">
              <i className={item.icon} />
            </div>
            <div className="nav__title">{t(item.titleKey)}</div>
          </a>
        </div>
      );
    }

    const childLinks = (item.children || []).map((child) => {
      const full = child.path.startsWith("/")
        ? child.path
        : `${item.path}/${child.path}`;
      const altPrefix = child.path.startsWith("all_")
        ? `/${child.path.replace(/^all_/, "")}`
        : null;
      const active =
        location.pathname === full ||
        (altPrefix && location.pathname.startsWith(altPrefix));
      return { child, full, active };
    });

    const isActiveParent =
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/") ||
      childLinks.some((x) => x.active);

    // If mobile + has children, link to first child instead
    const hasKids = !!item.children?.length;
    const firstChild = hasKids
      ? item.children![0].path.startsWith("/")
        ? item.children![0].path
        : `${item.path}/${item.children![0].path}`
      : item.path;

    return (
      <div key={item.path} className="nav__item">
        <Link
          to={
            isMobile && hasKids
              ? firstChild
              : hasKids && !isMobile
              ? "#"
              : item.path
          }
          className={`nav__link ${isActiveParent ? "active" : ""}`}
          title={t(item.titleKey)}
          style={{
            color: isActiveParent
              ? "#5E81F4"
              : theme.palette.mode === "dark"
              ? "#A0A0A0"
              : "#8181A5",
            fontWeight: isActiveParent ? "bold" : "normal",
            borderRadius: "6px",
          }}
          onClick={(e) => {
            // Desktop parent-click opens inline submenu
            if (!isMobile && hasKids) {
              e.preventDefault();
              // if we’re collapsed, open the sidebar first
              if (!isExtended) {
                onToggleExtended(true);
              }
              toggleSubmenu(item.path);
            } else {
              setIsSecondaryVisible(false);
              setOpenSubmenus({});
            }
          }}
        >
          <div className="nav__preview">
            <i className={item.icon} />
          </div>
          <div className="nav__title">{t(item.titleKey)}</div>
          {!isMobile && hasKids && (
            <div className="submenu-toggle">
              <i
                className={`la la-angle-${
                  openSubmenus[item.path] ? "down" : "right"
                }`}
              />
            </div>
          )}
        </Link>

        {/* Inline desktop submenu even when collapsed */}
        {hasKids && !isMobile && openSubmenus[item.path] && (
          <div className="submenu">
            {childLinks.map(({ child, full, active }) => (
              <Link
                key={full}
                to={full}
                className={`nav__link submenu-item ${active ? "active" : ""}`}
                title={t(child.titleKey)}
                style={{
                  color: active
                    ? "#5E81F4"
                    : theme.palette.mode === "dark"
                    ? "#A0A0A0"
                    : "#8181A5",
                  fontWeight: active ? "bold" : "normal",
                  borderRadius: "6px",
                }}
                onClick={() => setIsSecondaryVisible(false)}
              >
                {t(child.titleKey)}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`sidebar ${isMobile ? "mobile-visible" : ""} ${
        isExtended ? "extended" : "collapsed"
      } ${theme.palette.mode === "dark" ? "dark-mode" : ""}`}
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <div className="sidebar__nav" style={{ height: "100%" }}>
        <nav className={`nav js-nav ${isExtended ? "extended" : "collapsed"}`}>
          {/* Logo */}
          {/* Logo */}
          <Link className="nav__link nav__link_head" to="#">
            {isExtended ? (
              /* ─── extended: full-width logo ───────────────────────────── */
              <img
                src={logo_full}
                alt="Alpha Trust AI"
                className="nav__logo nav__logo--full"
              />
            ) : (
              /* ─── collapsed: just the icon ───────────────────────────── */
              <div className="nav__preview">
                <img
                  src={logo}
                  alt="Alpha Trust AI"
                  className="nav__logo nav__logo--icon"
                />
              </div>
            )}
          </Link>

          {/* Primary nav */}
          <div
            className={`nav__primary js-nav-primary ${
              isNavHidden ? "hidden" : ""
            }`}
            style={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: isMobile
                ? theme.palette.mode === "dark"
                  ? "#1C1D21"
                  : "#FFFFFF"
                : "transparent",
            }}
          >
            <div className="nav__group">
              {(isMobile ? primaryItems : navItems).map(renderNavItem)}

              {/* only mobile gets the bars to open secondary */}
              {isMobile && (
                <a
                  className={`nav__link nav__link_menu js-nav-link-menu ${
                    isSecondaryVisible ? "active" : ""
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSecondaryVisible((v) => !v);
                  }}
                >
                  <div className="nav__preview">
                    <i className="la la-bars" />
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Secondary (mobile only) */}
          {isMobile && (
            <div
              className={`nav__secondary js-nav-secondary ${
                isSecondaryVisible ? "visible" : ""
              }`}
            >
              {/* back button */}
              <div className="nav__group">
                <a
                  href="#"
                  className="nav__link nav__link_menu js-nav-link-menu"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSecondaryVisible(false);
                  }}
                >
                  <div className="nav__preview">
                    <i className="la la-angle-left" />
                  </div>
                </a>
              </div>
              {/* then all remaining items */}
              <div className="nav__group">
                {navItems
                  .filter((it) => !primaryItems.some((p) => p.path === it.path))
                  .map((item) => {
                    const hasKids = !!item.children?.length;
                    const isOpen = !!openSubmenus[item.path];

                    if (hasKids) {
                      return (
                        <div key={item.path} className="nav__item">
                          <a
                            href="#"
                            className={`nav__link ${isOpen ? "active" : ""}`}
                            title={t(item.titleKey)}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSubmenu(item.path);
                            }}
                          >
                            <div className="nav__preview">
                              <i className={item.icon} />
                            </div>
                            <div className="nav__title">{t(item.titleKey)}</div>
                            <div className="submenu-toggle">
                              <i
                                className={`la la-angle-${
                                  isOpen ? "down" : "right"
                                }`}
                              />
                            </div>
                          </a>
                          {isOpen && (
                            <div className="submenu">
                              {item.children!.map((child) => {
                                const full = child.path.startsWith("/")
                                  ? child.path
                                  : `${item.path}/${child.path}`;
                                return (
                                  <Link
                                    key={full}
                                    to={full}
                                    className="nav__link submenu-item"
                                    title={t(child.titleKey)}
                                    onClick={() => setIsSecondaryVisible(false)}
                                  >
                                    {t(child.titleKey)}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // simple link
                    return (
                      <Link
                        key={item.path}
                        to={item.external ?? item.path}
                        className="nav__link"
                        title={t(item.titleKey)}
                        onClick={() => setIsSecondaryVisible(false)}
                      >
                        <div className="nav__preview">
                          <i className={item.icon} />
                        </div>
                        <div className="nav__title">{t(item.titleKey)}</div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
