import Route from "./Route.js";

// Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/home.html", []),
    new Route("/todoliste", "ToDoListe", "/pages/todoliste.html", [], "js/todoliste.js"),
    new Route("/signin", "Connexion", "/pages/auth/signin.html", ["disconnected"], "js/auth/signin.js"),
    new Route("/signup", "Inscription", "/pages/auth/signup.html", ["disconnected"], "js/auth/signup.js"),
    new Route("/account", "Mon Compte", "/pages/auth/account.html", []),
    new Route("/editPassword", "Changement de mot de passe", "/pages/auth/editPassword.html",[]),
    new Route("/rendezVous", "Vos Rendez-Vous", "/pages/rendez-vous.html", []),
    new Route("/calendar", "Calendrier", "/pages/calendar.html", [], "/js/calendar.js"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "MySmartAgenda";