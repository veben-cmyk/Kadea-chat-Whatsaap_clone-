
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

        // Succès !
        afficherToastSucces("Inscription réussie !");

        // Petite pause avant redirection
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (erreur) {
        errorMessage.textContent = "⚠️ " + erreur.message;
    }
}