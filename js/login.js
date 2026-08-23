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
// 
// 
// ==========================================
// 1. SÉLECTION DES ÉLÉMENTS HTML
// ==========================================
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// ==========================================
// 2. ÉCOUTE DE LA SOUMISSION DU FORMULAIRE
// ==========================================
loginForm.addEventListener('submit', verifierLogin);

async function verifierLogin(e) {
    e.preventDefault(); // On empêche la page de se recharger

    // Récupération des valeurs des champs
    const emailValue = document.getElementById('login-email').value.trim();
    const passwordValue = document.getElementById('login-password').value;

    // VÉRIFICATION : Est-ce qu'un champ est resté vide ?
    if (emailValue === "" || passwordValue === "") {
        errorMessage.textContent = "⚠️ Veuillez remplir tous les champs.";
        return; 
    }

    errorMessage.textContent = ""; // On efface l'ancienne erreur

    const donnéesConnexion = {
        email: emailValue,
        password: passwordValue
    };

    try {
        const reponse = await fetch('https://kadea-chat-api.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc'
            },
            body: JSON.stringify(donnéesConnexion)
        });

        const data = await reponse.json();

        if (!reponse.ok) {
            throw new Error(data.message || "Email ou mot de passe incorrect.");
        }

        // Extrait le token de manière hautement sécurisée (peu importe la structure de la réponse)
        const token = data.token || data.data?.token || data.accessToken;

        if (!token) {
            console.error(" Token introuvable dans la réponse API :", data);
            errorMessage.textContent = "⚠️ Erreur de configuration du serveur (token absent).";
            return;
        }

        //  ON ENREGISTRE LE TOKEN DANS LE NAVIGATEUR
        localStorage.setItem("token", token);
        console.log(" TOKEN STOCKÉ AVEC SUCCÈS");

        // Toast de connexion réussie
        afficherToastSucces("Connexion réussie !");

        // Petite pause avant redirection
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 2000);

    } catch (erreur) {
        errorMessage.textContent = "⚠️ " + erreur.message;
    }
}