// import { users } from "/js/mockData.js";  plus utile si tu passes en mode réel
import { apiUrl, RoleCookieName, tokenCookieName, testMode } from "../config.js";
import { setToken, setCookie } from "../script.js";

const mailInput = document.getElementById('EmailInput');
const passwordInput = document.getElementById('PasswordInput');
const btnSignIn = document.getElementById('btnSignin');
const signinForm = document.getElementById('signinForm');

//  Désactiver le mode test pour ne plus utiliser les données mock
// const testMode = true;  Assure-toi que cette variable n’est pas définie ailleurs

btnSignIn.addEventListener('click', checkCredentials);

function checkCredentials(e) {
    e.preventDefault(); //  sinon ça recharge la page
    const email = mailInput.value.trim();
    const password = passwordInput.value.trim();

    //  Appel réel à ton backend
    //let dataFrom = new FormData(signinForm);

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        "email": email,
        "password": password //  Doit correspondre au nom utilisé côté serveur
    });

    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // 💥 IMPORTANT pour le CORS avec cookies/tokens
        body: raw
    };


    fetch(apiUrl + "login", requestOptions)
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                console.error("Erreur API:", data.message || "Connexion échouée");
                mailInput.classList.add("is-invalid");
                passwordInput.classList.add("is-invalid");
                throw new Error(data.message || "Connexion échouée");
            }
            return data;
        })
        .then((result) => {
            const token = result.apiToken;
            setToken(token); // Sauvegarde le token
            setCookie(RoleCookieName, result.roles[0], 7); // Sauvegarde le rôle
            window.location.replace("/"); // Redirige après la connexion
        })
        .catch((error) => {
            console.error("Erreur lors de la connexion :", error);
        });

}
