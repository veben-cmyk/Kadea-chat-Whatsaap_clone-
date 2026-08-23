// 🔹 Appliquer le thème au chargement
function initTheme() {
    const choixStocke = localStorage.getItem("theme");
    const systemeEstSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (choixStocke === "dark" || (!choixStocke && systemeEstSombre)) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    
    updateIcon();
}

// 🔹 Changer le thème au clic
function toggleTheme() {
    const htmlElement = document.documentElement;
    const passeEnSombre = htmlElement.classList.toggle("dark");
    
    if (passeEnSombre) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
    
    updateIcon();
}

// 🔹 Permuter les icônes Lune / Soleil
function updateIcon() {
    const iconDark = document.getElementById('theme_icon_dark');
    const iconLight = document.getElementById('theme_icon_light');

    if (!iconDark || !iconLight) return;

    if (document.documentElement.classList.contains('dark')) {
        iconDark.classList.add('hidden');
        iconLight.classList.remove('hidden');
    } else {
        iconLight.classList.add('hidden');
        iconDark.classList.remove('hidden');
    }
}

// 🔹 Écoute globale sur le document pour parer à tous les cas
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});

// Écoute même si le bouton est réinjecté ou chargé tardivement
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn_theme_toggle')) {
        toggleTheme();
    }
});