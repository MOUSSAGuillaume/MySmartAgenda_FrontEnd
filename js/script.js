// Configuration globale
const apiUrl = "http://localhost:8000/api/"; // choisis le bon port/backend
const RoleCookieName = "role"; // choisis une seule convention
const tokenCookieName = "accesstoken";
const testMode = false; // Passe à false quand tu veux tester le vrai backend ; Passe à true pour simuler des données

const signoutBtn = document.getElementById("signout-btn");
if (signoutBtn) {
    signoutBtn.addEventListener("click", signout);
}

function getRole() {
    return getCookie(RoleCookieName);
}

function signout() {
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    window.location.reload();
}

function setToken(token) {
    setCookie(tokenCookieName, token, 7); // cookie pour 7 jours
}

function getToken() {
    return getCookie(tokenCookieName);
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function isConnected() {
    return !!getToken();
}

/*
disconnected 
connected (admin ou client)
 - admin 
 - client 
*/
function showAndHideElementsForRoles() {
    const userConnected = isConnected();
    const role = getRole();

    let allElementsToEdit = document.querySelectorAll('[data-show]');

    allElementsToEdit.forEach(element => {
        switch (element.dataset.show) {
            case 'disconnected':
                if (userConnected) {
                    element.classList.add("d-none");
                }
                break;
            case 'connected':
                if (!userConnected) {
                    element.classList.add("d-none");
                }
                break;
            case 'admin':
                if (!userConnected || role !== "admin") {
                    element.classList.add("d-none");
                }
                break;
            case 'client':
                if (!userConnected || role !== "client") {
                    element.classList.add("d-none");
                }
                break;
        }
    });
}

function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}

// ✅ Fonction mockée si testMode est activé
function getInfoUser() {
    if (testMode) {
        // Simule une réponse d'utilisateur sans contact API
        return Promise.resolve({
            id: 1,
            name: "Alice Test",
            email: "alice@mock.com",
            role: getRole() || "client" // par défaut client
        });
    }

    //  API réelle (désactivée en mode test)
    
    let myHeaders = new Headers();
    myHeaders.append("X-AUTH-TOKEN", getToken());
    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }
    return fetch(apiUrl + "account/me", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des infos utilisateur");
            }
            return response.json();
        })
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log("Erreur lors de la récupération des données utilisateur", error);
        });

}
// Lancement global une fois que tout est chargé
    window.addEventListener("DOMContentLoaded", () => {
        showAndHideElementsForRoles();

        getInfoUser().then(user => {
            console.log("Utilisateur connecté :", user);

            const nameEl = document.getElementById("user-name");
            if (nameEl && user?.name) {
                nameEl.textContent = user.name;
            }
        });
    });
