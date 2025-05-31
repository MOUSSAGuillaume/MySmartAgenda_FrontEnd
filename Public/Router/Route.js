export default class Route {
    constructor(url, title, pathHtml,  authorize, pathJS = "") {
        this.url = url; // L'URL de la route
        this.title = title; // Le titre de la page
        this.pathHtml = pathHtml; // Le chemin vers le fichier HTML de la page
        this.pathJS = pathJS; // Le chemin vers le fichier JavaScript de la page (optionnel)
        this.authorize = authorize
    }
}

/*
[] -> Tout le monde peut y accéder
 ["disconnected"] -> Réserver aux utilisateurs déconnecté
utilisateurs */