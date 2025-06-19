import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Swal from "sweetalert2";

interface SidebarProps {
    CustomComponent: React.ComponentType;
}

const Sidebar: React.FC<SidebarProps> = ({ CustomComponent }) => {
    const location = useLocation();
    const nav = useNavigate()

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const [isOpen, setIsOpen] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState(() => localStorage.getItem("openSubMenu") === "true");

    // Handle theme toggle
    useEffect(() => {
        const root = document.documentElement;
        const theme = darkMode ? "dark" : "light";
        root.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [darkMode]);

    // Handle sidebar open/close
    useEffect(() => {
        const body = document.body;
        const sidebar = document.getElementById("sidebar");

        if (!sidebar) return;

        if (isOpen) {
            body.style.overflowY = "hidden";
            sidebar.classList.add("active");
        } else {
            body.style.overflowY = "auto";
            sidebar.classList.remove("active");
        }

        localStorage.setItem("openSubMenu", String(openSubMenu));
    }, [isOpen, openSubMenu]);

    const onLogout = async () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success py-2 px-3 me-3",
                cancelButton: "btn btn-danger py-2 px-3"
            },
            buttonsStyling: false
        });

        const result = await swalWithBootstrapButtons.fire({
            title: "Are you sure?",
            text: "You gonna log out from this web",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            localStorage.removeItem('auth');
            nav('/login');
        }
    };

    // Helper function to determine active submenu
    const isEmployeeActive = location.pathname.startsWith("/employee")

    const isProductActive = location.pathname.startsWith("/product")

    const isSalesAreaActive = location.pathname.startsWith("/sales-coverage-area");

    const isRetailActive = location.pathname.startsWith("/retail");

    const isMasterMenuActive = isEmployeeActive || isProductActive || isSalesAreaActive || isRetailActive;

    return (
        <div id="app">
            <div id="sidebar">
                <div className={`sidebar-wrapper ${isOpen ? "active" : ""}`} style={{ zIndex: 9999 }}>
                    <div className="sidebar-header position-relative">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="logo">
                                <Link to="/"> <span>Sebar.In</span> </Link>
                            </div>
                            <div className="theme-toggle d-flex gap-2 align-items-center mt-2">
                                {/* Light icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--system-uicons" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 21 21">
                                    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.5 14.5c2.219 0 4-1.763 4-3.982a4.003 4.003 0 0 0-4-4.018c-2.219 0-4 1.781-4 4c0 2.219 1.781 4 4 4zM4.136 4.136L5.55 5.55m9.9 9.9l1.414 1.414M1.5 10.5h2m14 0h2M4.135 16.863L5.55 15.45m9.899-9.9l1.414-1.415M10.5 19.5v-2m0-14v-2" opacity=".3"></path>
                                        <g transform="translate(-210 -1)">
                                            <path d="M220.5 2.5v2m6.5.5l-1.5 1.5"></path>
                                            <circle cx="220.5" cy="11.5" r="4"></circle>
                                            <path d="m214 5l1.5 1.5m5 14v-2m6.5-.5l-1.5-1.5M214 18l1.5-1.5m-4-5h2m14 0h2"></path>
                                        </g>
                                    </g>
                                </svg>

                                {/* Toggle */}
                                <div className="form-check form-switch fs-6">
                                    <input
                                        className="form-check-input me-0"
                                        type="checkbox"
                                        id="toggle-dark"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                    />
                                </div>

                                {/* Dark icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--mdi" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3l3.19.09m3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95l2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31Z">
                                    </path>
                                </svg>
                            </div>
                            <div className="sidebar-toggler x">
                                <Link
                                    to="#"
                                    className="sidebar-hide d-xl-none d-block"
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <i className="bi bi-x bi-middle"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-menu">
                        <ul className="menu">
                            <li className="sidebar-title">Menu</li>

                            <li className={`sidebar-item ${location.pathname === "/" ? "active" : ""}`}>
                                <Link to="/" className="sidebar-link">
                                    <i className="bi bi-grid-fill"></i>
                                    <span>Dashboard</span>
                                </Link>
                            </li>

                            <li className={`sidebar-item ${isMasterMenuActive ? "active" : ""} has-sub`}>
                                <Link
                                    to="#"
                                    className="sidebar-link"
                                    onClick={() => {
                                        const newState = !openSubMenu;
                                        setOpenSubMenu(newState);
                                        localStorage.setItem("openSubMenu", String(newState));
                                    }}
                                >
                                    <i className="bi bi-stack"></i>
                                    <span>Masters</span>
                                </Link>

                                <ul className={`submenu ${openSubMenu ? "submenu-open" : ""}`}>
                                    <li className={`submenu-item ${isEmployeeActive ? "active" : ""}`}>
                                        <Link to="/employee" className="submenu-link">Employees</Link>
                                    </li>
                                    <li className={`submenu-item ${isProductActive ? "active" : ""}`}>
                                        <Link to="/product" className="submenu-link">Products</Link>
                                    </li>
                                    <li className={`submenu-item ${isSalesAreaActive ? "active" : ""}`}>
                                        <Link to="/sales-coverage-area" className="submenu-link">Sales Areas</Link>
                                    </li>
                                    <li className={`submenu-item ${isRetailActive ? "active" : ""}`}>
                                        <Link to="/retail" className="submenu-link">Retails</Link>
                                    </li>
                                </ul>
                            </li>
                            <li className={`sidebar-item `}>
                                <a onClick={onLogout} className="sidebar-link" style={{ cursor: 'pointer' }}>
                                    <i className="bi bi-door-open-fill"></i>
                                    <span>Log Out</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div id="main">
                <header className="mb-3">
                    <Link to="#" className="burger-btn d-block d-xl-none" onClick={() => setIsOpen((prev) => !prev)}>
                        <i className="bi bi-justify fs-3"></i>
                    </Link>
                </header>

                <div className="page-content">
                    <CustomComponent />
                </div>

                <Footer name="Sebari.in" />
            </div>
        </div>
    );
};

export default Sidebar;
