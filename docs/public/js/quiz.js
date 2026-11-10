(function () {
    // Tipos de resultado 
    var APTO = 'apto';             // No impide donar
    var TEMPORAL = 'temporal';     // No apto por ahora
    var DEFINITIVO = 'definitivo'; // No apto

    var PREGUNTAS = [
        {
            texto: '¿Tienes entre 18 y 65 años?',
            ayuda: '',
            opciones: [
                { etiqueta: 'Sí', tipo: APTO },
                {
                    etiqueta: 'No, soy menor de 18 años',
                    tipo: TEMPORAL,
                    motivo: 'Para donar necesitas tener al menos 18 años.',
                    espera: 'cuando cumplas 18 años.'
                },
                {
                    etiqueta: 'No, tengo más de 65 años',
                    tipo: DEFINITIVO,
                    motivo: 'La edad máxima para donar sangre es de 65 años.'
                }
            ]
        },
        {
            texto: '¿Pesas más de 50 kg?',
            ayuda: '',
            opciones: [
                { etiqueta: 'Sí', tipo: APTO },
                {
                    etiqueta: 'No',
                    tipo: TEMPORAL,
                    motivo: 'Necesitas pesar más de 50 kg para que la donación no afecte tu salud.',
                    espera: 'cuando tu peso sea mayor a 50 kg.'
                }
            ]
        },
        {
            texto: '¿Tienes una identificación oficial vigente con fotografía?',
            ayuda: 'Por ejemplo: INE, cédula profesional, cartilla militar, pasaporte o licencia de conducir.',
            opciones: [
                { etiqueta: 'Sí', tipo: APTO },
                {
                    etiqueta: 'No',
                    tipo: TEMPORAL,
                    motivo: 'Es indispensable presentar una identificación oficial vigente con fotografía.',
                    espera: 'cuando cuentes con tu identificación vigente.'
                }
            ]
        },
        {
            texto: '¿Te hiciste algún tatuaje o perforación en los últimos 12 meses?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Te hiciste un tatuaje o perforación hace menos de 12 meses.',
                    espera: 'cuando hayan pasado 12 meses desde el tatuaje o la perforación.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Tomaste alcohol o algún medicamento en las últimas 12 horas?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Tomaste alcohol o medicamentos en las últimas 12 horas.',
                    espera: 'cuando hayan pasado al menos 12 horas. Si tomas un medicamento de forma regular, coméntalo en el banco de sangre.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Recibiste alguna vacuna en el último mes?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Recibiste una vacuna hace menos de un mes.',
                    espera: 'cuando haya pasado un mes desde la vacuna.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Tuviste algún procedimiento dental en los últimos 7 días?',
            ayuda: 'Por ejemplo: limpieza, extracción, endodoncia o resina.',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Tuviste un procedimiento dental hace menos de 7 días.',
                    espera: 'cuando hayan pasado 7 días desde el procedimiento.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Te hicieron alguna cirugía mayor en los últimos 6 meses?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Tuviste una cirugía mayor hace menos de 6 meses.',
                    espera: 'cuando hayan pasado 6 meses desde la cirugía.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Recibiste alguna transfusión de sangre en el último año?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Recibiste una transfusión hace menos de un año.',
                    espera: 'cuando haya pasado un año desde la transfusión.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Eres portador de hepatitis B o hepatitis C?',
            ayuda: '',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: DEFINITIVO,
                    motivo: 'Las personas portadoras de hepatitis B o C no pueden donar sangre, para proteger la salud de quien la recibe.'
                },
                { etiqueta: 'No', tipo: APTO }
            ]
        },
        {
            texto: '¿Estás embarazada, en periodo de lactancia o tuviste un parto, cesárea o pérdida del embarazo en los últimos 6 meses?',
            ayuda: 'Si esta pregunta no aplica para ti, elige "No aplica".',
            opciones: [
                {
                    etiqueta: 'Sí',
                    tipo: TEMPORAL,
                    motivo: 'Estás embarazada, en lactancia o tuviste un parto, cesárea o pérdida hace menos de 6 meses.',
                    espera: 'cuando ya no estés embarazada ni en lactancia y hayan pasado al menos 6 meses desde el parto, la cesárea o la pérdida.'
                },
                { etiqueta: 'No', tipo: APTO },
                { etiqueta: 'No aplica', tipo: APTO }
            ]
        }
    ];

    // Elementos de la página
    var zonaPreguntas = document.getElementById('quiz-preguntas');
    var formulario = document.getElementById('quiz-formulario');
    var contador = document.getElementById('quiz-contador');
    var barra = document.getElementById('quiz-barra');
    var relleno = document.getElementById('quiz-relleno');
    var texto = document.getElementById('quiz-texto');
    var ayuda = document.getElementById('quiz-ayuda');
    var opciones = document.getElementById('quiz-opciones');
    var error = document.getElementById('quiz-error');
    var botonAnterior = document.getElementById('quiz-anterior');
    var botonSiguiente = document.getElementById('quiz-siguiente');
    var zonaResultado = document.getElementById('quiz-resultado');
    var contenidoResultado = document.getElementById('quiz-resultado-contenido');
    var botonReiniciar = document.getElementById('quiz-reiniciar');

    if (!zonaPreguntas || !formulario || !zonaResultado) {
        return;
    }

    // Estado del quiz: índice actual y la opción elegida en cada pregunta
    var actual = 0;
    var respuestas = [];

    // Crea un elemento con clase y texto opcionales
    function crear(etiqueta, clase, contenido) {
        var elemento = document.createElement(etiqueta);
        if (clase) {
            elemento.className = clase;
        }
        if (contenido) {
            elemento.textContent = contenido;
        }
        return elemento;
    }

    // Muestra la pregunta actual
    function mostrarPregunta(moverFoco) {
        var pregunta = PREGUNTAS[actual];
        var total = PREGUNTAS.length;
        var numero = actual + 1;

        // Progreso
        contador.textContent = 'Pregunta ' + numero + ' de ' + total;
        barra.setAttribute('aria-valuemax', total);
        barra.setAttribute('aria-valuenow', numero);
        relleno.style.width = (numero / total * 100) + '%';

        // Texto y ayuda
        texto.textContent = pregunta.texto;
        ayuda.textContent = pregunta.ayuda;
        ayuda.hidden = !pregunta.ayuda;

        // Opciones como botones de radio
        opciones.innerHTML = '';
        pregunta.opciones.forEach(function (opcion, indice) {
            var id = 'opcion-' + actual + '-' + indice;
            var etiqueta = crear('label', 'quiz__opcion');
            var radio = document.createElement('input');

            radio.type = 'radio';
            radio.name = 'respuesta';
            radio.id = id;
            radio.value = indice;
            radio.className = 'quiz__radio';
            radio.checked = respuestas[actual] === indice;
            etiqueta.htmlFor = id;

            etiqueta.appendChild(radio);
            etiqueta.appendChild(crear('span', 'quiz__opcion-texto', opcion.etiqueta));
            opciones.appendChild(etiqueta);
        });

        // Botones de navegación
        error.hidden = true;
        botonAnterior.disabled = actual === 0;
        botonSiguiente.textContent = numero === total ? 'Ver resultado' : 'Siguiente';

        if (moverFoco) {
            texto.focus();
        }
    }

    // Guarda la opción marcada. Devuelve false si no hay ninguna
    function guardarRespuesta() {
        var marcada = formulario.querySelector('input[name="respuesta"]:checked');
        if (!marcada) {
            return false;
        }
        respuestas[actual] = Number(marcada.value);
        return true;
    }

    // Calcula el resultado a partir de las respuestas
    function calcularResultado() {
        var definitivos = [];
        var temporales = [];

        respuestas.forEach(function (indiceOpcion, indicePregunta) {
            var opcion = PREGUNTAS[indicePregunta].opciones[indiceOpcion];
            if (opcion.tipo === DEFINITIVO) {
                definitivos.push(opcion);
            } else if (opcion.tipo === TEMPORAL) {
                temporales.push(opcion);
            }
        });

        if (definitivos.length > 0) {
            return { tipo: DEFINITIVO, motivos: definitivos };
        }
        if (temporales.length > 0) {
            return { tipo: TEMPORAL, motivos: temporales };
        }
        return { tipo: APTO, motivos: [] };
    }

    // Construye y muestra la tarjeta de resultado
    function mostrarResultado() {
        var resultado = calcularResultado();
        var encabezado = crear('div', 'resultado resultado--' + resultado.tipo);
        var titulo = crear('h2', 'resultado__titulo');
        var descripcion = crear('p', 'resultado__texto');
        var lista;

        titulo.id = 'resultado-titulo';
        titulo.tabIndex = -1;

        if (resultado.tipo === APTO) {
            titulo.textContent = 'Posiblemente apto';
            descripcion.textContent = 'Según tus respuestas, podrías donar sangre. ¡Gracias por querer ayudar! Antes de ir, recuerda:';

            lista = crear('ul', 'lista-revision');
            lista.appendChild(crear('li', '', 'Llega con mínimo 6 horas de ayuno, después de una cena ligera y sin grasas.'));
            lista.appendChild(crear('li', '', 'Lleva tu identificación oficial vigente con fotografía.'));
            lista.appendChild(crear('li', '', 'Reserva toda la mañana: el proceso dura cerca de 3 horas.'));
        } else if (resultado.tipo === TEMPORAL) {
            titulo.textContent = 'No apto por ahora';
            descripcion.textContent = 'Según tus respuestas, en este momento no podrías donar, pero más adelante sí podrías hacerlo.';

            lista = crear('ul', 'resultado__motivos');
            resultado.motivos.forEach(function (opcion) {
                var elemento = crear('li', '');
                elemento.appendChild(crear('span', 'resultado__motivo', opcion.motivo));
                elemento.appendChild(crear('span', 'resultado__espera', 'Podrías volver a intentarlo: ' + opcion.espera));
                lista.appendChild(elemento);
            });
        } else {
            titulo.textContent = 'No apto';
            descripcion.textContent = 'Según tus respuestas, no podrías donar sangre. Aun así, puedes ayudar invitando a otras personas a donar.';

            lista = crear('ul', 'resultado__motivos');
            resultado.motivos.forEach(function (opcion) {
                var elemento = crear('li', '');
                elemento.appendChild(crear('span', 'resultado__motivo', opcion.motivo));
                lista.appendChild(elemento);
            });
        }

        encabezado.appendChild(titulo);
        encabezado.appendChild(descripcion);

        contenidoResultado.innerHTML = '';
        contenidoResultado.appendChild(encabezado);
        contenidoResultado.appendChild(lista);

        zonaPreguntas.hidden = true;
        zonaResultado.hidden = false;
        titulo.focus();
    }

    // Avanzar (el formulario se envía con "Siguiente" o con Enter)
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        if (!guardarRespuesta()) {
            error.hidden = false;
            return;
        }

        if (actual < PREGUNTAS.length - 1) {
            actual++;
            mostrarPregunta(true);
        } else {
            mostrarResultado();
        }
    });

    // Retroceder conservando la respuesta marcada
    botonAnterior.addEventListener('click', function () {
        guardarRespuesta();
        if (actual > 0) {
            actual--;
            mostrarPregunta(true);
        }
    });

    // Oculta el mensaje de error al elegir una opción
    opciones.addEventListener('change', function () {
        error.hidden = true;
    });

    // Reinicia el quiz desde cero
    botonReiniciar.addEventListener('click', function () {
        actual = 0;
        respuestas = [];
        zonaResultado.hidden = true;
        zonaPreguntas.hidden = false;
        mostrarPregunta(true);
    });

    // Inicio
    zonaPreguntas.hidden = false;
    mostrarPregunta(false);
})();
