// Configuration globale
/*const apiUrl = "http://localhost:8000/api/";
const RoleCookieName = "role";
const tokenCookieName = "accesstoken";
const testMode = false;*/

import { apiUrl, RoleCookieName, tokenCookieName, testMode } from "./config.js";

// Déconnexion
const signoutBtn = document.getElementById("signout-btn");
if (signoutBtn) {
    signoutBtn.addEventListener("click", signout);
}

function signout() {
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    window.location.href = "/"; // Redirection propre
}

// Token & Cookies
export function setToken(token) {
    setCookie(tokenCookieName, token, 7);
}

function getToken() {
    return getCookie(tokenCookieName);
}

function getRole() {
    return getCookie(RoleCookieName);
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

function isConnected() {
    return !!getToken();
}

// Affichage conditionnel selon les rôles
function showAndHideElementsForRoles() {
    const userConnected = isConnected();
    const role = getRole();

    const elements = document.querySelectorAll('[data-show]');
    elements.forEach(el => {
        switch (el.dataset.show) {
            case 'disconnected':
                if (userConnected) el.classList.add("d-none");
                break;
            case 'connected':
                if (!userConnected) el.classList.add("d-none");
                break;
            case 'admin':
                if (!userConnected || role !== "admin") el.classList.add("d-none");
                break;
            case 'client':
                if (!userConnected || role !== "client") el.classList.add("d-none");
                break;
        }
    });
}

// Sécurisation du contenu HTML
function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Récupération des infos utilisateur
function getInfoUser() {
    if (testMode) {
        return Promise.resolve({
            id: 1,
            name: "Alice Test",
            email: "alice@exemple.com",
            role: getRole() || "client"
        });
    }

    const headers = new Headers();
    console.log("TOKEN envoyé au back :", getToken()); // Doit afficher un token
    headers.append("X-AUTH-TOKEN", getToken());

    return fetch(`${apiUrl}account/me`, {
        method: 'GET',
        headers,
        redirect: 'follow'
    })
        .then(response => {
            if (!response.ok) throw new Error("Erreur lors de la récupération des infos utilisateur");
            return response.json();
        })
        .catch(error => {
            console.warn("⛔ Erreur utilisateur :", error);
            eraseCookie(tokenCookieName);
            eraseCookie(RoleCookieName);

            const currentPath = window.location.pathname;
            if (!currentPath.includes("signin")) {
                window.location.href = "/signin";
            }
        });

}

// Chargement DOM
window.addEventListener("DOMContentLoaded", () => {
    showAndHideElementsForRoles();

    // Évite appel infini sur signin.html
    const currentPath = window.location.pathname;
    const isSigninPage = currentPath.includes("signin.html");

    if (!isSigninPage) {
        getInfoUser().then(user => {
            if (!user) return;

            console.log("TOKEN utilisé :", getToken());
            console.log("Utilisateur connecté :", user);

            const nameEl = document.getElementById("user-name");
            if (nameEl && user?.name) {
                nameEl.textContent = user.name;
            }
        });
    }
});
export {
    isConnected,
    getInfoUser,
    showAndHideElementsForRoles
};
