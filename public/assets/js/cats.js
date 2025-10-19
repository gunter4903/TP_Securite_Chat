document.addEventListener('DOMContentLoaded', () => {
    fetch('/listingCats')
        .then(res => res.json())
        .then(cats => {
            const catsContainer = document.getElementById('cats');
            catsContainer.innerHTML = "";

            cats.forEach(cat => {
                const catElement = document.createElement('div');
                catElement.className = 'cat';
                catElement.innerHTML = `
                    <img src="../assets/image/chat.jpg" alt="${cat.name}">
                    <h2>${cat.name}</h2>
                    <p>${cat.birthday} ans</p>
                    <a href="/listingCatsPage" class="hover:text-amber-700 font-medium">Infos</a>`;

                catsContainer.appendChild(catElement);
            })
        })
        .catch(err => {
            console.error("Load error (cats) :", err);
        });
})