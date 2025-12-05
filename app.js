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

            // Inicializamos letras, dejando espacios visibles
            letrasAdivinadas = data.name.split('').map(c => c === ' ' ? ' ' : '_');

            // Establecemos maxlength del input al total de caracteres (incluyendo espacios)
            $('#guess').attr('maxlength', data.name.length);

            // Inicializamos propiedades de planeta y película
            personajeData.homeworldName = 'Cargando...';
            personajeData.filmName = 'Cargando...';

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
        $('#pistas').html(`
            Nombre a adivinar: ${letrasAdivinadas.join(' ')}<br>
            Planeta: ${personajeData.homeworldName}<br>
            Película: ${personajeData.filmName}
        `);
    }

    function comprobar() {
        let guess = $('#guess').val();

        if(!guess || !personajeData) return;

        // Validar longitud exacta (incluyendo espacios)
        if(guess.length !== personajeData.name.length){
            alert(`El nombre debe tener exactamente ${personajeData.name.length} caracteres (incluyendo espacios).`);
            return;
        }

        // Comparar letra por letra
        let acierto = false;
        let nombreArray = personajeData.name.split('');

        for(let i = 0; i < nombreArray.length; i++){
            if(nombreArray[i].toLowerCase() === guess[i].toLowerCase()){
                letrasAdivinadas[i] = nombreArray[i];
                acierto = true;
            }
        }

        actualizarPista();

        // Comprobar si se acertó completo
        if(letrasAdivinadas.join('') === personajeData.name){
            victorias++;
            $('#victorias').text(victorias);
            mostrarResultado(true);
        } else if(!acierto){
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
