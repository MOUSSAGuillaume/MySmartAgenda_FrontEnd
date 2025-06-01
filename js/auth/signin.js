const mailInput = document.getElementById('EmailInput');
const passwordInput = document.getElementById('PasswordInput');
const btnSignIn = document.getElementById('btnSignin');
const signinForm = document.getElementById('signinForm');

btnSignIn.addEventListener('click', checkCredentials);

function checkCredentials() {
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

    fetch(apiUrl+"login", requestOptions)
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                // Affiche une erreur visuelle (par exemple ajout de classes invalid)
                mailInput.classList.add("is-invalid");
                passwordInput.classList.add("is-invalid");
                // Tu peux aussi afficher un message d'erreur spécifique ici
                throw new Error(data.message || "Connexion échouée");
            }
            return data;
        })
        .then((result) => {
            // Si on arrive ici, la connexion est réussie
            const token = result.apiToken;
            setToken(token);
            setCookie(RoleCookieName, result.roles[0], 7);
            window.location.replace("/"); // Redirection vers la page de compte
        })
        .catch((error) => {
            console.error("Erreur lors de la connexion :", error);
        });
}
