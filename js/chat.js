import { obtenirInitiales } from "./helpers.js";



// ==============================
// 🔐 SECURITÉ TOKEN
// ==============================
const token = localStorage.getItem('token');

if(!token){
    window.location.href = "login.html";
}

const API_key = 'wksp_f1d83a58937e08d450975f8210ae45dc';

// ==============================
// 🎯 SELECTION DES ELEMENTS HTML
// ==============================
const nomUtilisateur = document.getElementById('nom-utilisateur');
const listeDiscussions = document.getElementById('liste-discussions');
const conversationSection = document.getElementById('conversation-list'); // 🛠️ CORRECTIF : Sélection de la liste complète

// helpers avatar
const avatarImg = document.getElementById("avatar");
const initialsSpan = document.getElementById("initials");

// éléments du chat
const chatContainer = document.getElementById("chat-container");
const form = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const chatSection = document.getElementById("chat-section");

const btnBackToList = document.getElementById("btn-back-to-list");

const chatNomUtilisateur = document.getElementById('chat-nom-utilisateur');

// Stockage des états de l'application
let conversationActiveId = null;
let monIdUtilisateur = null; // 🛠️ CORRECTIF : Variable pour stocker mon ID globalement

// barre de recherche 
let tousLesUtilisateurs = []; //  Boîte pour stocker tous les utilisateurs reçus de l'API
let mesConversations = [];

// ==============================
// 👤 CHARGER MON PROFIL
// ==============================
async function ChargerMonProfil() {
    try{
        const response = await fetch('https://kadea-chat-api.onrender.com/auth/me',{
            method : 'GET',
            headers : {
                'x-api-key' : API_key,
                'Authorization' : `Bearer ${token}`
            }
        });

        if(!response.ok) throw new Error("Session expirée!");
            
        const responseData = await response.json();
        const user = responseData.data.user;

        // 🛠️ CORRECTIF : Sauvegarde de mon ID pour la comparaison des messages
        monIdUtilisateur = user.id; 

        // Affichage nom
        if(nomUtilisateur){
            nomUtilisateur.textContent = user.fullName || 'Moi';
        }

        // Avatar ou initiales
        if(user.avatarUrl) {
            avatarImg.src = user.avatarUrl;
            avatarImg.classList.remove("hidden");
            initialsSpan.classList.add("hidden");
        } else {
            initialsSpan.textContent = obtenirInitiales(user.fullName || "MOI");
            initialsSpan.classList.remove("hidden");
            avatarImg.classList.add("hidden");
        }

        // Une fois mon profil chargé, je peux charger les utilisateurs
        chargerUtilisateursWorkspace();

    } catch(erreur) {
        console.error('erreur de connexion:', erreur);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Lancement initial du profil
ChargerMonProfil();


// ==============================
// 👥 CHARGER UTILISATEURS
// ==============================
async function chargerUtilisateursWorkspace() {
    try {
        const response = await fetch('https://kadea-chat-api.onrender.com/users', {
            method: 'GET',
            headers: {
                'x-api-key': API_key,
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Impossible de récupérer les utilisateurs");

        const responseData = await response.json();
        const apiData = responseData.data || responseData;
        const utilisateurs = apiData.users || apiData;

        // Filtrer pour ne pas s'afficher soi-même dans la liste (optionnel mais plus propre)
        const autresUtilisateurs = utilisateurs.filter(u => u.id !== monIdUtilisateur);

        // ------------------------
        // -------------------------  barre de recherche
        //  ON SAUVEGARDE LA LISTE ICI
        tousLesUtilisateurs = autresUtilisateurs;


        // On attend que les conversations soient chargées AVANT d'afficher
        await chargerMesConversations();


        // afficher les utilisateurs à l'ecran
        afficherUtilisateurs(autresUtilisateurs);
        return autresUtilisateurs;

    } catch (erreur) {
        console.error("Erreur utilisateurs:", erreur);
        return [];
    }
}

async function chargerMesConversations() {
    try {
        const response = await fetch('https://kadea-chat-api.onrender.com/conversations', {
            method: 'GET',
            headers: {
                'x-api-key': API_key,
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Impossible de récupérer les conversations");

        const responseData = await response.json();
        const apiData = responseData.data || responseData;
        mesConversations = apiData.conversations || apiData;

    } catch (erreur) {
        console.error("Erreur conversations:", erreur);
    }
}

function trouverConversationAvecUtilisateur(userId) {
    return mesConversations.find(conv => {
        return conv.participants.some(p => p.userId === userId);
    });
}


// ==============================
// 🆕 AFFICHER UTILISATEURS
// ==============================
function afficherUtilisateurs(utilisateurs){
    if(!listeDiscussions) return;

    listeDiscussions.innerHTML = "";

    utilisateurs.forEach(user => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl cursor-pointer";

        const conv = trouverConversationAvecUtilisateur(user.id);
const dernierMessage = conv?.messages?.[0];
const texteApercu = dernierMessage ? dernierMessage.content : "Démarrer une discussion";

// si l'utilisateur n'a pas d'avatar, on affiche ses initiales
    const avatarHTML = user.avatarUrl
    ? `<img src="${user.avatarUrl}" class="w-10 h-10 rounded-full flex-shrink-0 object-cover" alt="${user.fullName}">`
    : `<div class="w-10 h-10 rounded-full flex-shrink-0 bg-blue-600 text-white flex items-center justify-center text-sm font-bold">${obtenirInitiales(user.fullName)}</div>`;

        div.innerHTML = `
            ${avatarHTML}
    <div class="overflow-hidden">
        <p class="font-medium text-sm dark:text-gray-200">${user.fullName}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${texteApercu}</p>
    </div>
`;

        div.addEventListener("click", () => {
            // 🛠️ CORRECTIF MOBILE : Masquer la liste et afficher le chat
            if (conversationSection && chatSection) {
                conversationSection.classList.add("hidden");
                chatSection.classList.remove("hidden");
            }

        // 🛠️ MISE A JOUR DYNAMIQUE DU NOM DANS LE HEADER
            if (chatNomUtilisateur) {
            chatNomUtilisateur.textContent = user.fullName;
            }
            
            creerOuOuvrirConversation(user.id);
        });

        listeDiscussions.appendChild(div);
    });
}


// ==============================
// 🆕 CREER / OUVRIR CONVERSATION
// ==============================
async function creerOuOuvrirConversation(userId){
    try {
        const response = await fetch('https://kadea-chat-api.onrender.com/conversations', {
            method: 'POST',
            headers: {
                'x-api-key': API_key,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "private",
                name: "Discussion",
                participantIds: [userId]
            })
        });

        const data = await response.json();

        if(!data.success || !data.data){
            throw new Error(data.message || "Aucune donnée reçue");
        }

        conversationActiveId = data.data.conversation.id;
        
        // Charger les messages de cette discussion
        chargerMessages();

    } catch (error) {
        console.error("Erreur conversation:", error);
    }
}


// ==============================
// 🆕 CHARGER MESSAGES
// ==============================
async function chargerMessages(){
    if(!conversationActiveId) return;

    try {
        const response = await fetch(`https://kadea-chat-api.onrender.com/conversations/${conversationActiveId}/messages`, {
            method: 'GET',
            headers: {
                'x-api-key': API_key,
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const messages = data.data.messages || [];

        chatContainer.innerHTML = "";

        if(messages.length === 0){
            chatContainer.innerHTML = `
                <p class="text-center text-gray-400 mt-4">
                    Aucun message pour le moment
                </p>
            `;
            return;
        }

        messages.forEach(msg => {
            const div = document.createElement("div");

            // 🛠️ CORRECTIF : On vérifie si l'ID du sender correspond à MON ID connecté
            const isMe = msg.senderId === monIdUtilisateur;

            div.className = isMe
                ? "max-w-[70%] bg-blue-600 text-white p-3 rounded-2xl rounded-br-none ml-auto shadow-sm text-sm flex flex-col gap-1 relative group"
                : "max-w-[70%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-2xl rounded-bl-none mr-auto shadow-sm text-sm flex flex-col gap-1";

                // On récupère l'heure formatée (msg.createdAt ou msg.timestamp selon l'API)
            const heureAffichage = formaterHeure(msg.createdAt || msg.timestamp);

            // Couleur du texte de l'heure (blanc transparent si c'est moi, gris si c'est l'autre)
            const couleurHeure = isMe ? "text-blue-200" : "text-gray-400";

            // 🎯 Si c'est MON message, on ajoute le menu contextuel 
            let menuActionsHTML = "";
            if (isMe) {
                menuActionsHTML = `
                    <div class="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto z-10">
                        <!-- Le petit bouton trois points -->
                        <button class="text-white hover:bg-blue-700 w-5 h-5 flex items-center justify-center rounded-full font-bold focus:outline-none menu-trigger">
                            ⋮
                        </button>
                        
                        <!-- La mini boîte d'options (Masquée par défaut via 'hidden') -->
                        <div class="hidden absolute right-0 mt-1 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 flex flex-col z-20 options-menu">
                            <button class="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5 btn-modifier">
                                <span>✏️</span> Modifier
                            </button>
                            <button class="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 btn-supprimer">
                                <span>🗑️</span> Supprimer
                            </button>
                        </div>
                    </div>`;
            }

            // 🎯 ON INJECTE LE TEXTE ET L'HEURE et le menu supprimer et modifier
            div.innerHTML = `
                ${menuActionsHTML}
                <span>${msg.content}</span>
                <span class="text-[10px] ${couleurHeure} text-right select-none block font-normal">
                    ${heureAffichage}
                </span>
            `;

            // Ecouteur d'evenement 
            // ✅ CORRECTIF : Sélection et déclaration avant utilisation
            if(isMe){
                const trigger = div.querySelector('.menu-trigger');
                const menu = div.querySelector('.options-menu');
                const btnModif = div.querySelector('.btn-modifier');
                const btnSuppr = div.querySelector('.btn-supprimer');

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    document.querySelectorAll('.options-menu').forEach(m => {
                        if(m !== menu) m.classList.add('hidden');
                    });
                    menu.classList.toggle('hidden');
                });

                btnModif.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.add('hidden');
                    modifierMessage(msg.id, msg.content);
                });

                btnSuppr.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.add('hidden');
                    supprimerMessage(msg.id);
                });
            }
            chatContainer.appendChild(div);
        });

        // 🆕 BONUS : Scroll automatique vers le bas pour voir le dernier message reçu
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        console.error("Erreur messages:", error);
    }   
}
document.addEventListener('click', () => {
    document.querySelectorAll('.options-menu').forEach(menu => menu.classList.add('hidden'));
});

// 🆕  BOUTON RETOUR ICI :
if (btnBackToList) {
    btnBackToList.addEventListener("click", () => {
        console.log("Clic sur retour détecté !"); // Petit log pour être sûr que ça marche
        
        if (conversationSection && chatSection) {
            // Sur mobile : on réaffiche la liste et on cache le chat
            conversationSection.classList.remove("hidden");
            chatSection.classList.add("hidden");
        }
    });
}


// ==============================
// 🆕 ENVOYER MESSAGE
// ==============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = messageInput.value.trim();

    if(!content || !conversationActiveId) return;

    try {
        const response = await fetch(`https://kadea-chat-api.onrender.com/conversations/${conversationActiveId}/messages`,{
            method: 'POST',
            headers: {
                'x-api-key': API_key,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erreur lors de l'envoi");
        }

        messageInput.value = "";

        // Rafraîchir instantanément la boîte pour voir le message
        chargerMessages();

    } catch (error) {
        console.error("Erreur envoi:", error);
    }
});

// ==============================
//  RECHERCHER UN COLLÈGUE
// ==============================
const barreRecherche = document.getElementById('search-input'); // S'Assure-toi d'avoir id="search-input" sur mon input HTML

if(barreRecherche){
    barreRecherche.addEventListener('input', (e) => {
        const texteRecherche = e.target.value.toLowerCase().trim();
        // Si la barre est vide, on réaffiche tous les collègues
        if (!texteRecherche) {
            afficherUtilisateurs(tousLesUtilisateurs);
            return;
        }
        // On filtre notre tableau de collègues sur leur nom
        const utilisateursFiltres = tousLesUtilisateurs.filter(user => {
            const nomComplet = user.fullName ? user.fullName.toLowerCase() : "";
            return nomComplet.includes(texteRecherche);
        });
        // On affiche uniquement les résultats correspondants
        afficherUtilisateurs(utilisateursFiltres);
    });
}


// ==============================
// 🕒 FORMATAGE DE L'HEURE
// ==============================
function formaterHeure(dateString) {
    // Si l'API ne renvoie pas de date pour le message, on prend l'heure actuelle
    const date = dateString ? new Date(dateString) : new Date();
    
    const heures = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${heures}:${minutes}`;
}

// ==========================================
// 📝 ACTION : MODIFIER UN MESSAGE (PATCH)
// ==========================================

async function modifierMessage(messageId, ancienContenu) {
    // Demande le nouveau texte à l'utilisateur
    const { value: nouveauContenu } = await Swal.fire({
    title: 'Modifier le message',
    input: 'textarea',
    inputValue: ancienContenu,
    inputLabel: 'Nouveau contenu',
    inputPlaceholder: 'Entrez le nouveau texte de votre message...',
    showCancelButton: true,
    confirmButtonText: 'Enregistrer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    inputAttributes: {
    rows: 3
    },
    didOpen: () => {
      // Focus dans le champ à l'ouverture
        const textarea = Swal.getInput();
        if (textarea) textarea.focus();
    }
    });

    // Sécurité : si annulé, vide ou identique, on stoppe tout
    if (!nouveauContenu || nouveauContenu.trim() === "" || nouveauContenu === ancienContenu) return;

    try {
        const response = await fetch(`https://kadea-chat-api.onrender.com/messages/${messageId}`,{
            method : 'PATCH',
            headers : {
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({content: nouveauContenu.trim() })    

        })

        if (!response.ok) throw new Error("Échec de la modification sur le serveur.");

        // Tout s'est bien passé : on recharge la liste pour voir le changement
        chargerMessages();

    } catch (error) {
        console.error("Erreur PATCH:", error);
    }
    
}

// ==========================================
// 🗑️ ACTION : SUPPRIMER UN MESSAGE (DELETE)
// ==========================================

async function supprimerMessage(messageId) {
    const result = await Swal.fire({
    title: 'Supprimer ce message ?',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280'
    });
    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`https://kadea-chat-api.onrender.com/messages/${messageId}`,{
            method: 'DELETE',
            headers: {
                'x-api-key': 'wksp_f1d83a58937e08d450975f8210ae45dc',
                'Authorization' : `Bearer ${token}`,
            }
        })

        if (!response.ok) throw new Error("Échec de la suppression sur le serveur.");

        // Tout s'est bien passé : on rafraîchit
        chargerMessages();
    } catch (error) {
        console.error("Erreur DELETE:", error);
    }
}


