(function() {
    const container = document.getElementById('boxContainer');
    const divs = [];
    let startIndex = 1;
    let pokeMax = 649;
    let isAnimating = false;
    let isShiny = false;
    let gens = [1, 152, 252, 387, 494];
    let screen1 = document.getElementById("screen");

    async function fetchPokemonData(index) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
        const data = await response.json();
        return data;
    }

    async function fetchPokemonImages() {
        const pokeData = [];

        for (let i = startIndex - 2; i < startIndex + 3; i++) {
            const currentIndex = (i - 1 + pokeMax) % pokeMax + 1;
            const data = await fetchPokemonData(currentIndex);
            pokeData.push(data);
        }

        pokeData.forEach((data, index) => {
            if (!divs[index]) {
                const div = document.createElement('div');
                div.classList.add('box');
                container.appendChild(div);
                divs.push(div);
            }

            const img = divs[index].querySelector('img') || document.createElement('img');
            img.dataset.normalSrc = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
            img.dataset.shinySrc = data['sprites']['versions']['generation-v']['black-white']['animated']['front_shiny'];
            img.src = isShiny ? img.dataset.shinySrc : img.dataset.normalSrc;
            img.alt = data.name;

            if (!divs[index].querySelector('img')) {
                divs[index].appendChild(img);
            }
        });

        while (divs.length > 5) {
            const removedDiv = divs.pop();
            removedDiv.remove();
        }
        inicializarPosiciones();
        actualizarClases();
    }

    function actualizarClases() {
        divs.forEach((div, index) => {
            div.classList.remove('extremo', 'medio', 'focus');

            if (index === 2) {
                div.classList.add('focus');
            } else if (index === 1 || index === 3) {
                div.classList.add('medio');
            } else {
                div.classList.add('extremo');
            }

            div.style.transform = `translateX(${(index - 2) * 160}px)`;
        });
        mostrarEstadisticas();
    }

    async function searchPokemon() {
        const input = document.getElementById('searchInput').value.toLowerCase();
        screen1.innerHTML = 'Loading...';
        
        try {
            const data = await fetchPokemonData(input);
            if (data.id <= pokeMax) {
                setTimeout(() => {
                    startIndex = data.id;
                    fetchPokemonImages();
                }, 2000);
            } else {
                throw new Error('Not found');
            }
        } catch (error) {
            screen1.innerHTML = 'Error - Not found :(';
    
            setTimeout(() => {
                startIndex = 1;
                fetchPokemonImages();
            }, 1500);
        }
        document.getElementById('searchInput').value="";
    }

    
    function mostrarEstadisticas() {
        const screen = document.getElementById('screen');
        const pokemonFocus = divs[2];
        const img = pokemonFocus.querySelector('img');
        const pokemonName = img.alt;
        const screenMini = document.getElementById("search-id");

        fetchPokemonData(pokemonName).then(data => {
            const stats = data.stats;
            const types = data.types.map(t => t.type.name).join(', ');
            const background = document.getElementById('boxContainer');
            const firstType = data.types[0].type.name;

            switch (firstType) {
                case 'grass':
                    background.style.backgroundImage = 'url(img/grass.jpeg)'
                    break;
                case 'water':
                    background.style.backgroundImage = 'url(img/water.jpeg)'
                    break;
                case 'fire':
                    background.style.backgroundImage = 'url(img/fire.gif)'
                    break;
                case 'ghost':
                    background.style.backgroundImage = 'url(img/ghost.jpeg)'
                    break;
                case 'rock':
                    background.style.backgroundImage = 'url(img/rock.jpeg)'
                    break;
                case 'electric':
                    background.style.backgroundImage = 'url(img/electric.jpeg)'
                    break;
                case 'psychic':
                    background.style.backgroundImage = 'url(img/psychic.jpeg)'
                    break;
                case 'ice':
                    background.style.backgroundImage = 'url(img/ice.jpeg)'
                    break;
            
                default:
                    background.style.backgroundImage = 'url(img/forest.jpeg)'
                    break;
            }
            
            screen.innerHTML = `
                <div class="states">
                    <h3>${pokemonName.toUpperCase()}</h3>
                    <p><strong>Type:</strong> ${types.toUpperCase()}</p>
                </div>
                <ul class="stats-list">
                    ${stats.map(stat => `<li>${stat.stat.name.toUpperCase()}: ${stat.base_stat}</li>`).join('')}
                </ul>
            `;
            screenMini.textContent=`Id: #${data.id}`;
        });
    }

    function moverDerecha() {
        if (isAnimating) return;
        isAnimating = true;

        const firstElement = divs.shift();
        divs.push(firstElement);
        startIndex = (startIndex % pokeMax) + 1;
        fetchPokemonImages();
        actualizarClases();

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function moverIzquierda() {
        if (isAnimating) return;
        isAnimating = true;

        const lastElement = divs.pop();
        divs.unshift(lastElement);
        startIndex = (startIndex - 2 + pokeMax) % pokeMax + 1;
        fetchPokemonImages();
        actualizarClases();

        setTimeout(() => {
            isAnimating = false;
        }, 200);
    }

    function toggleShiny() {
        isShiny = !isShiny;

        divs.forEach((div) => {
            const img = div.querySelector('img');
            img.style.transform = 'scale(0)';

            setTimeout(() => {
                img.src = isShiny ? img.dataset.shinySrc : img.dataset.normalSrc;
                img.style.transform = 'scale(1)';
            }, 400);
        });
    }

    function nextGeneration() {
        for (let i = 0; i < gens.length; i++) {
            if (startIndex < gens[i]) {
                startIndex = gens[i];
                fetchPokemonImages();
                return;
            }
        }
        startIndex = gens[0];
        fetchPokemonImages();
    }

    function prevGeneration() {
        for (let i = gens.length - 1; i >= 0; i--) {
            if (startIndex >= gens[i]) {
                startIndex = gens[i - 1] || gens[gens.length - 1];
                fetchPokemonImages();
                return;
            }
        }
    }

    function inicializarPosiciones() {
        divs.forEach((div, index) => {
            div.style.position = 'absolute';
            div.style.transform = `translateX(${(index - 2) * 120}px)`;
        });
    }

    document.getElementById('searchButton').addEventListener('click', searchPokemon);
    document.getElementById('moveLeft').addEventListener('click', moverIzquierda);
    document.getElementById('moveRight').addEventListener('click', moverDerecha);
    document.getElementById('toggleShiny').addEventListener('click', toggleShiny);
    document.getElementById('nextGen').addEventListener('click', nextGeneration);
    document.getElementById('prevGen').addEventListener('click', prevGeneration);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moverIzquierda();
        else if (e.key === 'ArrowRight') moverDerecha();
    });

    fetchPokemonImages();
})();
