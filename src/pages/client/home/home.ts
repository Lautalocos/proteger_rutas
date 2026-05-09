// src/pages/client/home/home.ts

import { checkAuhtUser, logout } from "../../../utils/auth";

const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
    logout();
});

const initPage = () => {
    // Si no hay sesión → login. Si es admin → admin/home.
    // Si es client → redirige al store
    checkAuhtUser(
        "/src/pages/auth/login/login.html",
        "/src/pages/admin/home/home.html",
        "client"
    );

    // Redirigimos al store automáticamente
    window.location.href = "/src/pages/store/home/home.html";
};

initPage();
