import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";
import { isConnected, getInfoUser, showAndHideElementsForRoles } from "../js/script.js";

// Route 404 par défaut
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);

// Récupération d'une route à partir de l'URL
const getRouteByUrl = (url) => {
    return allRoutes.find(route => route.url === url) || route404;
};

// Fonction principale pour charger dynamiquement le contenu de la page
const LoadContentPage = async () => {
    const path = window.location.pathname;
    const actualRoute = getRouteByUrl(path);
    const allRolesArray = actualRoute.authorize;

    try {
        // 🔐 Gestion des autorisations
        if (allRolesArray.length > 0) {
            // Cas utilisateur non connecté interdit
            if (!allRolesArray.includes("disconnected")) {
                const user = await getInfoUser();
                if (!user || !allRolesArray.includes(user.role)) {
                    window.location.replace("/");
                    return;
                }
            }
            // Cas route réservée aux non-connectés (ex: signin, signup)
            if (allRolesArray.includes("disconnected") && isConnected()) {
                window.location.replace("/");
                return;
            }
        }

        // 📄 Chargement de la page HTML
        const res = await fetch(actualRoute.pathHtml);
        const html = await res.text();
        document.getElementById("main-page").innerHTML = html;

        // 💡 Titre de la page
        document.title = `${actualRoute.title} - ${websiteName}`;

        // 🧠 Chargement JS spécifique à la page (si défini)
        console.log("Import dynamique de :", actualRoute.pathJS);

        if (actualRoute.pathJS) {
            import(actualRoute.pathJS)
                .then(module => {
                    if (typeof module.default === "function") {
                        module.default(); // Fonction d'initialisation
                    }
                })
                .catch(err => {
                    console.error("Erreur lors du chargement du module JS :", err);
                });
        }

        // 👁️ Mise à jour des éléments visibles selon les rôles
        showAndHideElementsForRoles();

    } catch (err) {
        console.error("Erreur lors du chargement de la page :", err);
        window.location.replace("/404"); // Fallback si une page échoue
    }
};

// 🎯 Gestion du clic sur un lien interne
const routeEvent = (event) => {
    event.preventDefault();
    const href = event.target.href || event.currentTarget.href;
    window.history.pushState({}, "", href);
    LoadContentPage();
};

// Ajout unique d'un écouteur global sur tout document
document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a");
    if (!anchor) return; // Pas un lien
    // Vérifie si le lien est interne au site (même origine)
    if (anchor.origin === window.location.origin) {
        event.preventDefault();
        routeEvent(event);
    }
});


// 🔙 Gestion du bouton retour navigateur
window.onpopstate = LoadContentPage;

// 📦 Fonction globale accessible dans HTML : <a onclick="route(event)">
window.route = routeEvent;

// ⚙️ Premier chargement
LoadContentPage();
