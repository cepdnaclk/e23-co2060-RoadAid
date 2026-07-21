import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearAuth, getAuth } from "../auth";
import RoadAidLogo from "./RoadAidLogo";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const auth = useMemo(() => getAuth(), [location.pathname]);
  const isLoggedIn = !!auth?.token;
  const role = auth?.role;

  function goDashboard() {
    if (auth?.isStaff || auth?.isSuperuser) nav("/admin");
    else if (role === "customer") nav("/customer");
    else if (role === "mechanic") nav("/mechanic");
    else nav("/login");
  }

  function logout() {
    clearTimeout(closeTimerRef.current);
    clearAuth();
    setOpen(false);
    nav("/login");
  }

  function scrollToSection(id) {
    if (location.pathname !== "/") {
      nav(`/#${id}`);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openMenu() {
    clearTimeout(closeTimerRef.current);
    setOpen(true);
  }

  function closeMenuWithDelay() {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 500);
  }

  function closeMenuNow() {
    clearTimeout(closeTimerRef.current);
    setOpen(false);
  }

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
  }, []);

  return (
    <header className="siteNavWrap">
      <div className="siteNav">
        <button className="brandLogoText" onClick={() => nav("/")}>
          <RoadAidLogo className="navBrandMark" />
          <span>RoadAid</span>
        </button>

        <nav className="siteNavLinks">
          <button className="siteNavLink" onClick={() => scrollToSection("home")}>
            Home
          </button>
          <button className="siteNavLink" onClick={() => scrollToSection("how-it-works")}>
            How It Works
          </button>
          <button className="siteNavLink" onClick={() => scrollToSection("about")}>
            About Us
          </button>
          <button className="siteNavLink" onClick={() => scrollToSection("services")}>
            Services
          </button>
          <button className="siteNavLink" onClick={() => scrollToSection("contact")}>
            Contact
          </button>
        </nav>

        <div className="siteNavActions">
          <button className="btn btnEmergency navEmergencyBtn" onClick={goDashboard}>
            Request Emergency Help
          </button>

          {!isLoggedIn ? (
            <button className="profileIconBtn" onClick={() => nav("/login")} title="Login">
              <span className="profileIconCircle">👤</span>
            </button>
          ) : (
            <div
              className="profileMenuWrap"
              onMouseEnter={openMenu}
              onMouseLeave={closeMenuWithDelay}
            >
              <button
                className="profileIconBtn"
                onClick={() => {
                  clearTimeout(closeTimerRef.current);
                  setOpen((v) => !v);
                }}
                title="Profile"
              >
                <span className="profileIconCircle">👤</span>
              </button>

              {open && (
                <div
                  className="profileDropdown"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenuWithDelay}
                >
                  <div className="profileDropdownHeader">
                    <div className="profileDropdownName">{auth?.username || "User"}</div>
                    <div className="profileDropdownRole">{role || "account"}</div>
                  </div>

                  <button
                    className="profileDropdownItem"
                    onClick={() => {
                      closeMenuNow();
                      goDashboard();
                    }}
                  >
                    Dashboard
                  </button>

                  {role === "customer" && (
                    <>
                      <button
                        className="profileDropdownItem"
                        onClick={() => {
                          closeMenuNow();
                          nav("/customer");
                        }}
                      >
                        My Active Request
                      </button>
                      <button
                        className="profileDropdownItem"
                        onClick={() => {
                          closeMenuNow();
                          nav("/customer/history");
                        }}
                      >
                        My Service History
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        My Profile
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        Complaints
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        Settings
                      </button>
                    </>
                  )}

                  {role === "mechanic" && (
                    <>
                      <button
                        className="profileDropdownItem"
                        onClick={() => {
                          closeMenuNow();
                          nav("/mechanic");
                        }}
                      >
                        Active Jobs
                      </button>
                      <button
                        className="profileDropdownItem"
                        onClick={() => {
                          closeMenuNow();
                          nav("/mechanic/history");
                        }}
                      >
                        Service History
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        My Profile
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        Availability
                      </button>
                      <button className="profileDropdownItem" onClick={closeMenuNow}>
                        Reports
                      </button>
                      <button
                        className="profileDropdownItem"
                        onClick={() => {
                          closeMenuNow();
                          nav("/mechanic/settings");
                        }}
                      >
                        Settings
                      </button>
                    </>
                  )}

                  <button className="profileDropdownItem danger" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
