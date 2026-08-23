// Fonction pour extraire les deux premières initiales d'un nom
// Exemple : "Alex Rivera" -> "AR", "Jaden" -> "J"
export function obtenirInitiales(nom) {
    if(!nom) return "?";
    const mots = nom.trim().split(/\s+/) // Découpe le nom par les espaces 
    if (mots.length >= 2){
        return (mots[0].charAt(0) + mots[1].charAt(0).toUpperCase());
    }
    return mots[0].charAt(0).toUpperCase();
}

