(function() {
    const container = document.getElementById('boxContainer');
    const divs = []; // Arreglo dinámico para los elementos
    let startIndex = 1; // Índice inicial para los Pokémon
    let pokeMax = 649; // Total de Pokémon - Sexta Gen
    let isAnimating = false; // Control de animación
    let isShiny = false; // Estado de Shiny
    let gens = [1, 152, 252, 387, 494];
    let screen1 = document.getElementById("screen");

    // Función para obtener los datos de un Pokémon
    async function fetchPokemonData(index) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
        const data = await response.json();
        return data;
    }

    // Función para obtener las imágenes de los Pokémon
    async function fetchPokemonImages() {
        const pokeData = [];

        for (let i = startIndex - 2; i < startIndex + 3; i++) {
            const currentIndex = (i - 1 + pokeMax) % pokeMax + 1; // Lógica circular
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

            // Establecer atributos dataset con las URLs de las imágenes normal y Shiny
            img.dataset.normalSrc = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
            img.dataset.shinySrc = data['sprites']['versions']['generation-v']['black-white']['animated']['front_shiny'];

            // Usar la imagen correspondiente según el estado de Shiny
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

    // Función para actualizar las clases según el orden del arreglo
    function actualizarClases() {
        divs.forEach((div, index) => {
            div.classList.remove('extremo', 'medio', 'focus');

            if (index === 2) {
                div.classList.add('focus'); // El foco está en el medio (índice 2)
            } else if (index === 1 || index === 3) {
                div.classList.add('medio'); // Los medios
            } else {
                div.classList.add('extremo'); // Los extremos
            }

            // Posicionamos cada div dinámicamente
            div.style.transform = `translateX(${(index - 2) * 160}px)`;
        });
        // Llama a esta función después de actualizar las clases o cargar las imágenes
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
    }
    

    function mostrarEstadisticas() {
        const screen = document.getElementById('screen');
        const pokemonFocus = divs[2]; // El Pokémon en foco está siempre en el índice 2
        const img = pokemonFocus.querySelector('img');
        const pokemonName = img.alt; // Nombre del Pokémon en el foco
        const screenMini = document.getElementById("search-id");

        // Obtener los datos del Pokémon en foco
        fetchPokemonData(pokemonName).then(data => {
            const stats = data.stats; // Estadísticas del Pokémon
            const types = data.types.map(t => t.type.name).join(', '); // Tipos del Pokémon

            // Mostrar las estadísticas en el div "screen"
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

    // Función para mover el foco hacia la derecha
    function moverDerecha() {
        if (isAnimating) return; // No hacer nada si está animando
        isAnimating = true; // Marcar como en animación

        const firstElement = divs.shift(); // Sacar el primer elemento
        divs.push(firstElement); // Añadirlo al final
        startIndex = (startIndex % pokeMax) + 1; // Asegurar que el índice no se salga de rango
        fetchPokemonImages(); // Obtener los siguientes Pokémon
        actualizarClases(); // Actualizar las clases

        // Esperar a que termine la transición antes de permitir otra
        setTimeout(() => {
            isAnimating = false;
        }, 500); // Ajustar este tiempo según la duración de la animación
    }

    // Función para mover el foco hacia la izquierda
    function moverIzquierda() {
        if (isAnimating) return; // No hacer nada si está animando
        isAnimating = true; // Marcar como en animación

        const lastElement = divs.pop(); // Sacar el último elemento
        divs.unshift(lastElement); // Añadirlo al inicio
        startIndex = (startIndex - 2 + pokeMax) % pokeMax + 1; // Asegurar que el índice no se salga de rango
        fetchPokemonImages(); // Obtener los siguientes Pokémon
        actualizarClases(); // Actualizar las clases

        // Esperar a que termine la transición antes de permitir otra
        setTimeout(() => {
            isAnimating = false;
        }, 200); // Ajustar este tiempo según la duración de la animación
    }

    // Función para alternar entre Shiny y normal
    function toggleShiny() {
        isShiny = !isShiny; // Alternar estado

        divs.forEach((div) => {
            const img = div.querySelector('img');
            img.style.transform = 'scale(0)'; // Reducir escala para la transición

            setTimeout(() => {
                img.src = isShiny ? img.dataset.shinySrc : img.dataset.normalSrc; // Alternar imagen
                img.style.transform = 'scale(1)'; // Volver a escala normal
            }, 400); // Duración de la transición
        });
    }

    // Función para saltar a la siguiente generación
    function nextGeneration() {
        if (startIndex < gens[1]) {
            startIndex = gens[1];
        } else if (startIndex < gens[2]) {
            startIndex = gens[2];
        } else if (startIndex < gens[3]) {
            startIndex = gens[3];
        } else if (startIndex < gens[4]) {
            startIndex = gens[4];
        } else {
            startIndex = gens[0];
        }

        fetchPokemonImages();
    }

    // Función para retroceder a la generación anterior
    function prevGeneration() {
        if (startIndex >= gens[4]) {
            startIndex = gens[3];
        } else if (startIndex >= gens[3]) {
            startIndex = gens[2];
        } else if (startIndex >= gens[2]) {
            startIndex = gens[1];
        } else if (startIndex >= gens[1]) {
            startIndex = gens[0];
        } else {
            startIndex = gens[4];
        }

        fetchPokemonImages();
    }

    // Inicializar las posiciones al cargar
    function inicializarPosiciones() {
        divs.forEach((div, index) => {
            div.style.position = 'absolute'; // Posición absoluta para cada div
            div.style.transform = `translateX(${(index - 2) * 120}px)`; // Distribuir los divs horizontalmente
        });
    }

    // Event listeners para los botones
    document.getElementById('searchButton').addEventListener('click', searchPokemon);
    document.getElementById('moveLeft').addEventListener('click', moverIzquierda);
    document.getElementById('moveRight').addEventListener('click', moverDerecha);
    document.getElementById('toggleShiny').addEventListener('click', toggleShiny);
    document.getElementById('nextGen').addEventListener('click', nextGeneration);
    document.getElementById('prevGen').addEventListener('click', prevGeneration);

    // Event listeners para las teclas de flecha
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moverIzquierda();
        } else if (e.key === 'ArrowRight') {
            moverDerecha();
        }
    });

    // Obtener las imágenes de los Pokémon
    
    fetchPokemonImages();
})();
