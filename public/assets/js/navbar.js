document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav-links');
    fetch('/auth/status', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                nav.innerHTML = `
                    <a href="/catalogue" class="hover:text-amber-700 font-medium">Catalogue</a>
                    <a href="/profil" class="hover:text-amber-700 font-medium">Mon profil</a>
                    <button id="logoutBtn" class="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800">Déconnexion</button>
                `;
            } else {
                nav.innerHTML = `
                    <a href="/auth/login" class="hover:text-amber-700 font-medium">Connexion</a>
                    <a href="/auth/register" class="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800">Inscription</a>
                `;
            }
            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' })
                    .then(() => location.reload());
            });
        })
        .catch(err => console.error('Erreur status session:', err));
});
