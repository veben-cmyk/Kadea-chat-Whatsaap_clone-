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

chargerProfil();