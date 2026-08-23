
function afficherToastSucces(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });

    Toast.fire({
        icon: 'success',
        title: message
    });
}

// ==========================================
// 1. SÉLECTION DES ÉLÉMENTS
// ==========================================
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const registerButton = document.getElementById('register-button');
const registerButtonTexteOriginal = registerButton.textContent;

//fonction pour le chargement en cas d'attente prolongée de la réponse du serveur
function afficherChargement(texte) {
    registerButton.disabled = true;
    registerButton.textContent = texte;
};

function masquerChargement() {
    registerButton.disabled = false;
    registerButton.textContent = registerButtonTexteOriginal;
};

// ==========================================
// 2. ÉCOUTE DE LA SOUMISSION DU FORMULAIRE
// ==========================================
registerForm.addEventListener('submit', verifierFormulaire);

async function verifierFormulaire(e) {
    // Étape obligatoire : on empêche la page de se recharger
    e.preventDefault();

    // 3. RÉCUPÉRATION DES VALEURS DES CHAMPS
    const fullnameValue = document.getElementById('register-fullname').value.trim();
    const emailValue = document.getElementById('register-email').value.trim();
    const passwordValue = document.getElementById('register-password').value;
    const confirmValue = document.getElementById('register-confirm').value;

    // 4. LES VÉRIFICATIONS (VALIDATIONS)
    // VÉRIFICATION 1 : Est-ce qu'un champ est resté vide ?
    if (fullnameValue === "" || emailValue === "" || passwordValue === "" || confirmValue === "") {
        errorMessage.textContent = "⚠️ Veuillez remplir tous les champs.";
        return;
    }

    // VÉRIFICATION 2 : Est-ce que les deux mots de passe sont identiques ?
    if (passwordValue !== confirmValue) {
        errorMessage.textContent = "⚠️ Les mots de passe ne correspondent pas.";
        return;
    }

    // 5. ENVOI DES DONNÉES SI TOUT EST CORRECT
    errorMessage.textContent = ""; // On efface les anciennes erreurs

    const donnéesUtilisateur = {
        fullName: fullnameValue,
        email: emailValue,
        password: passwordValue
    };

    afficherChargement("Inscription en cours...");
    const timerReveil = setTimeout(() => {
        afficherChargement("Inscription en cours... (cela prend plus de temps que prévu)");
    }, 4000);


    try {
        const reponse = await fetch('https://kadea-chat-api.onrender.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc'
            },
            body: JSON.stringify(donnéesUtilisateur)
        });

        if (!reponse.ok) {
            throw new Error("Cet email est déjà utilisé ou les données sont invalides.");
        }

        const data = await reponse.json();
        clearTimeout(timerReveil);

        // Succès !
        afficherToastSucces("Inscription réussie !");

        // Petite pause avant redirection
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (erreur) {
        clearTimeout(timerReveil);
        masquerChargement();
        console.error("Erreur lors de l'inscription :", erreur);
        errorMessage.textContent = "⚠️ " + erreur.message;
    }
}