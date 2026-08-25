// Securité , on vérifie si l'utilisateur est connecté
const token = localStorage.getItem("token");

if(!token){
    // pas de jeton , redirection 
    window.location.href = 'login.html';
}

// On selectionne les éléments html à modifier
const nomUtilisateur = document.getElementById("nom-utilisateur");
const emailUtilisateur = document.getElementById("email-utilisateur");
const detailUsername = document.getElementById("detail-username");
const logoutbtn = document.getElementById("profile-logout-btn");

// selectionner le bouton pour modifier le nom profil de l'utilisateur 
// -------------------------------------------------------------------
const editProfileBtn = document.getElementById("edit-profile-btn");


// on selection les element pour modifier l'avatar de l'utilisateur
const avatarInput = document.getElementById("avatar-input");
const avatarProfil = document.getElementById("avatar-profil");


//  Demande d'infos à l'API
async function chargerProfil() {
    try{
        const response = await fetch('https://kadea-chat-api.onrender.com/auth/me',{
            method :'GET',
            headers : {
                'x-api-key' :'wksp_f1d83a58937e08d450975f8210ae45dc',
                'Authorization': `Bearer ${token}`
            }
        })

        if(!response.ok){
            throw new Error ("jeton expiré ou invalide");
        }

        const responseData = await response.json();

        // On inspecte la structure exacte reçue
        console.log("Données de l'API :", responseData);

        // on recupère l'utilisateur et on s'adapte si c'est dans data ou direct
        const apiData = responseData.data || responseData;
        const user = apiData.user || apiData;

        // Affichage avec des valeurs de secours au cas où l'API utilise d'autres clés (ex: user.name ou user.username)
        nomUtilisateur.textContent = user.fullName || "Utilisateur Kadea";
         // pour la photo de profil, on garde l'ancienne si l'API ne renvoie pas d'avatarUrl
        avatarProfil.src = user.avatarUrl || avatarProfil.src;
        emailUtilisateur.textContent = user.email || "email@exemple.com";
        // On utilise le fullName transformé en minuscules pour simuler un username propre
        if (user.fullName) {
            detailUsername.textContent = user.fullName.toLowerCase().replace(/\s+/g, '_');
        } else {
            detailUsername.textContent = "mon_pseudo";
        }

    }catch (erreur){
        console.error('erreur profil:', erreur);
        localStorage.removeItem("token");
        window.location.href = 'login.html';
    }
}

// Deconnexion (placée en dehors ou sécurisée si le bouton existe)
if (logoutbtn) {
    logoutbtn.addEventListener('click',() => {
        localStorage.removeItem("token");
        window.location.href="login.html";
    })
}

editProfileBtn.addEventListener("click", async () => {
    const { value: nouveauNom } = await Swal.fire({
        title: 'Modifier mon profil',
        input: 'text',
        inputValue: nomUtilisateur.textContent,
        inputLabel: 'Nom complet',
        inputPlaceholder: 'Entrez votre nom...',
        showCancelButton: true,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280'
    });

    if (!nouveauNom || nouveauNom.trim() === "" || nouveauNom === nomUtilisateur.textContent) return;

    try {
        const response = await fetch('https://kadea-chat-api.onrender.com/users/me', {
            method: 'PATCH',
            headers: {
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName: nouveauNom.trim() })
        });

        if (!response.ok) throw new Error("Échec de la mise à jour du profil.");

        // Mise à jour immédiate à l'écran, sans recharger la page
        nomUtilisateur.textContent = nouveauNom.trim();
        detailUsername.textContent = nouveauNom.trim().toLowerCase().replace(/\s+/g, '_');

    } catch (erreur) {
        console.error("Erreur PATCH profil:", erreur);
    }
});

// on ecoute le click sur l'avatar pour ouvrir le selecteur de fichier
avatarProfil.addEventListener("click", () => {
    avatarInput.click();
});

avatarInput.addEventListener("change", async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const formData = new FormData();
    formData.append("file", fichier);
    formData.append("upload_preset", "veben2001");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/hze8r3qp/image/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Échec de l'upload sur Cloudinary.");

        const data = await response.json();
        console.log("URL de l'image uploadée :", data.secure_url);

        // 🆕 On envoie maintenant cette URL à l'API Kadea pour l'enregistrer
        const reponsePatch = await fetch('https://kadea-chat-api.onrender.com/users/me', {
            method: 'PATCH',
            headers: {
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ avatarUrl: data.secure_url })
        });

        if (!reponsePatch.ok) throw new Error("Échec de la mise à jour de l'avatar.");

        // Mise à jour immédiate à l'écran, sans recharger la page
        avatarProfil.src = data.secure_url;

    } catch (erreur) {
        console.error("Erreur upload avatar:", erreur);
    }
});

chargerProfil();