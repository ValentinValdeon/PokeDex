function toggleScript() {
    const checkbox = document.getElementById("checkbox-butON");
    const scriptId = "extraScript";
    const existingScript = document.getElementById(scriptId);
    const screenPoke = document.querySelector(".screen-poke");
    const screenData = document.getElementById('screen'); 
    const screenMini = document.getElementById('search-id');

    if (checkbox.checked) {
        // Mostrar "Loading..." antes de cargar el script
        if (screenPoke) screenPoke.textContent = "Loading...";
        if (screenData) screenData.textContent = "Loading...";

        setTimeout(() => {
            // Si el script no existe, agregarlo después del timeout
            if (!existingScript) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.src = "script.js"; // Ruta del archivo JS adicional
                document.body.appendChild(script);
            }

            // Agregar la clase 'screen-pokeON' a .screen-poke
            if (screenPoke) screenPoke.classList.add("screen-pokeON");

            // Limpiar el texto de carga después de que el script se cargue
            if (screenPoke) screenPoke.textContent = "";
            if (screenData) screenData.textContent = "";
            if (screenMini) screenMini.textContent = "";

        }, 3000); // Espera 2 segundos antes de cargar el script

    } else {
        // Si el checkbox está desmarcado, eliminar el script adicional
        if (existingScript) existingScript.remove();  

        // Eliminar la clase 'screen-pokeON' de .screen-poke
        if (screenPoke) screenPoke.classList.remove("screen-pokeON");

        // Limpiar los divs generados dinámicamente y los elementos de imagen
        const container = document.getElementById('boxContainer');
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Eliminar clases dinámicas (focus, medio, extremo) y restaurar posiciones
        const divs = document.querySelectorAll('.box');
        divs.forEach(div => {
            div.classList.remove('focus', 'medio', 'extremo');
            div.style.transform = '';  
        });

        // Limpiar el contenido de 'screen-data'
        if (screenData) screenData.innerHTML = '';
        if (screenMini) screenMini.innerHTML = '';
    }
}

// Escuchar el evento de cambio del checkbox
document.getElementById("checkbox-butON").addEventListener("change", toggleScript);
