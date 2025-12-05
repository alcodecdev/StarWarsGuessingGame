$(document).ready(function() {
    let intentos = 5;
    let victorias = 0;
    let derrotas = 0;
    let personajeData = null;
    let letrasAdivinadas = [];

    function iniciarJuego() {
        $('#resultado').html('');
        $('#guess').val('');
        $('#intentos').text(intentos);
        letrasAdivinadas = [];

        const id = Math.floor(Math.random() * 83) + 1;
        const url = `https://swapi.dev/api/people/${id}/`;

        $.getJSON(url, function(data) {
            personajeData = data;

            // Normalizamos el nombre para eliminar espacios extra al inicio/final y reemplazamos múltiples espacios por uno
            const nombreNormalizado = data.name.trim().replace(/\s+/g, ' ');

            // Inicializar letras y espacios correctamente
            letrasAdivinadas = nombreNormalizado.split('').map(c => c === ' ' ? ' ' : '_');

            // Input limitado al total de caracteres (incluyendo espacios)
            $('#guess').attr('maxlength', nombreNormalizado.length);

            // Inicializar pistas
            personajeData.homeworldName = 'Cargando...';
            personajeData.filmName = 'Cargando...';
            personajeData.name = nombreNormalizado; // sobrescribimos con nombre normalizado

            actualizarPista();

            // Obtener planeta
            if(personajeData.homeworld){
                $.getJSON(personajeData.homeworld, function(pData){
                    personajeData.homeworldName = pData.name;
                    actualizarPista();
                });
            } else personajeData.homeworldName = 'Desconocido';

            // Obtener película principal
            if(personajeData.films.length > 0){
                $.getJSON(personajeData.films[0], function(fData){
                    personajeData.filmName = fData.title;
                    actualizarPista();
                });
            } else personajeData.filmName = 'Desconocida';
        });
    }

    function actualizarPista() {
        // Mostrar letras y espacios correctamente
        // Cada letra oculta = '_', cada espacio = '   ' (3 espacios para separación visual)
        let palabra = letrasAdivinadas.map(c => c === ' ' ? '   ' : c).join(' ');

        let longitudLetras = personajeData.name.replace(/\s/g, '').length;

        $('#pistas').html(`
        Nombre a adivinar: ${palabra}<br>
        Longitud del nombre (sin espacios): ${longitudLetras}<br>
        Planeta: ${personajeData.homeworldName}<br>
        Película: ${personajeData.filmName}
    `);
    }

    function comprobar() {
        let guess = $('#guess').val();

        if(!guess || !personajeData) return;

        // Validar longitud exacta incluyendo espacios
        if(guess.length !== personajeData.name.length){
            alert(`El nombre debe tener exactamente ${personajeData.name.length} caracteres, incluyendo espacios.`);
            return;
        }

        // Comparar letra por letra y actualizar letrasAdivinadas
        let nombreArray = personajeData.name.split('');
        for(let i = 0; i < nombreArray.length; i++){
            if(nombreArray[i].toLowerCase() === guess[i].toLowerCase()){
                letrasAdivinadas[i] = nombreArray[i];
            }
        }

        actualizarPista();

        // Si el intento completo es correcto
        if(guess.toLowerCase() === personajeData.name.toLowerCase()){
            victorias++;
            $('#victorias').text(victorias);
            mostrarResultado(true);
        } else {
            // Intento incorrecto → disminuir intentos
            intentos--;
            $('#intentos').text(intentos);

            if(intentos === 0){
                derrotas++;
                $('#derrotas').text(derrotas);
                mostrarResultado(false);
            }
        }

        $('#guess').val('');
    }


    function mostrarResultado(acertado){
        $('#resultado').html(`
            <h2>${personajeData.name}</h2>
            <p><strong>Año de nacimiento:</strong> ${personajeData.birth_year}</p>
            <p><strong>Altura:</strong> ${personajeData.height} cm</p>
            <p><strong>Peso:</strong> ${personajeData.mass} kg</p>
        `);

        intentos = 5;
        $('#intentos').text(intentos);
        setTimeout(iniciarJuego, 3000);
    }

    // Eventos
    $('#checkBtn').on('click', comprobar);
    $('#guess').on('keypress', function(e){
        if(e.which === 13) comprobar();
    });

    iniciarJuego();
});
