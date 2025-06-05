import { users } from "/js/mockData.js"; // ajuster le chemin selon l'organisation du projet

const mailInput = document.getElementById('EmailInput');
const passwordInput = document.getElementById('PasswordInput');
const btnSignIn = document.getElementById('btnSignin');
const signinForm = document.getElementById('signinForm');

btnSignIn.addEventListener('click', checkCredentials);

function checkCredentials() {
    const email = mailInput.value.trim();
    const password = passwordInput.value.trim();

    if (testMode) {
        // 🔁 Mode mock
        const user = users.find(u => u.email === email && u.password === password); // ✅ corrigé ici
        if (user) {
            setToken("fake-jwt-token");
            setCookie(RoleCookieName, user.role || "client", 7);
            window.location.replace("/");
        } else {
            mailInput.classList.add("is-invalid");
            passwordInput.classList.add("is-invalid");
        }
        return;
    }

    // 🌐 Mode réel (API)
    let dataFrom = new FormData(signinForm);

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        "username": dataFrom.get("email"),
        "password": dataFrom.get("mdp")
    });

    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(apiUrl + "login", requestOptions)
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                mailInput.classList.add("is-invalid");
                passwordInput.classList.add("is-invalid");
                throw new Error(data.message || "Connexion échouée");
            }
            return data;
        })
        .then((result) => {
            const token = result.apiToken;
            setToken(token);
            setCookie(RoleCookieName, result.roles[0], 7);
            window.location.replace("/");
        })
        .catch((error) => {
            console.error("Erreur lors de la connexion :", error);
        });
}
