import { apiUrl, RoleCookieName, tokenCookieName, testMode } from "../config.js";
//Implémenter le JS de ma page 
const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");

inputNom.addEventListener("keyup", validateForm);
inputPreNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);

//Fonction permettant de valider tout le formulaire
function validateForm() {
    const nomOk = validateRequires(inputNom);
    const prenomOk = validateRequires(inputPreNom);
    const mailOk = validateMail(inputMail);
    const passwordOk = validatePassword(inputPassword);
    const passwordConfirmOK = validateConfirmationPassword(inputPassword, inputValidationPassword);

    console.log({ nomOk, prenomOk, mailOk, passwordOk, passwordConfirmOK });

    if (nomOk && prenomOk && mailOk && passwordOk && passwordConfirmOK) {
        btnValidation.disabled = false;
    }
    else {
        btnValidation.disabled = true;
    }
}

function validateConfirmationPassword(inputPwd, inputConfirmPwd) {
    if (inputConfirmPwd.value === inputPwd.value && inputConfirmPwd.value !== "") {
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    }
    else {
        inputConfirmPwd.classList.add("is-invalid");
        inputConfirmPwd.classList.remove("is-valid");
        return false;
    }
}

function validateMail(_input) {
    //Définir mon regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = inputMail.value;
    if (mailUser.match(emailRegex)) {
        inputMail.classList.add("is-valid");
        inputMail.classList.remove("is-invalid");
        return true;
    }
    else {
        inputMail.classList.add("is-invalid");
        inputMail.classList.remove("is-valid");
        return false;
    }
}

function validatePassword(input) {
    //Définir mon regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;
    const isValid = passwordUser.match(passwordRegex);

    console.log("Mot de passe validé ?", !!isValid, passwordUser);

    if (isValid) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        return false;
    }
}


function validateRequires(input) {
    if (input.value != '') {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    }
    else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        return false;
    }
}

function InscrireUtilisateur() {

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const dataFrom = new FormData(formInscription);

    let raw = JSON.stringify({
        "nom": dataFrom.get("nom"),
        "prenom": dataFrom.get("prenom"),
        "email": dataFrom.get("email"),
        "password": dataFrom.get("password")
    });



    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(apiUrl + "registration", requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            else {
                alert("Erreur lors de l'inscription");
            }
        })
        .then((_result) => {
            alert("Bravo " + inputPreNom.value + ", vous êtes maintenant inscrit, vous pouvez vous connecter.");
            document.location.href = "/signin"

        })
        .catch((error) => console.error(error));
}