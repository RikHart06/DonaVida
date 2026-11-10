/* ==========================================================
   DonaVida - Formulario de pre-registro
   ----------------------------------------------------------
   1. Llena el select de bancos de sangre desde api/bancos.
   2. Valida los campos en el navegador antes de enviar.
   3. Envía los datos en JSON a api/preregistros.
   4. Muestra debajo de cada campo los errores que regrese el
      servidor, o el mensaje de éxito y limpia el formulario.

   Las rutas de la API son relativas (sin "/" al inicio) para
   que funcionen aunque el sitio esté publicado en una subcarpeta.
   ========================================================== */

(function () {
    var URL_BANCOS = 'api/bancos';
    var URL_PREREGISTROS = 'api/preregistros';

    // Mismas reglas que usa el servidor (src/validaciones/preregistro.js)
    var PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
    var PATRON_TELEFONO = /^\d{10}$/;
    // Revisión sencilla: texto, una @, texto, un punto y texto
    var PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Nombres de los campos, en el orden en que aparecen en el formulario
    var CAMPOS = ['nombre', 'correo', 'telefono', 'fecha_preferida', 'banco_id', 'acepta_aviso'];

    var formulario = document.getElementById('formulario-preregistro');

    // Si la página no tiene el formulario, no hay nada que hacer
    if (!formulario) {
        return;
    }

    var selectBancos = document.getElementById('banco_id');
    var campoFecha = document.getElementById('fecha_preferida');
    var botonEnviar = document.getElementById('boton-enviar');
    var textoBotonOriginal = botonEnviar.textContent;

    var mensajeExito = document.getElementById('mensaje-exito');
    var mensajeExitoTexto = document.getElementById('mensaje-exito-texto');
    var mensajeError = document.getElementById('mensaje-error');
    var mensajeErrorTexto = document.getElementById('mensaje-error-texto');

    // Guarda el mensaje si no se pudieron cargar los bancos
    var errorCargaBancos = '';

    /* ------------------------------------------------------
       Utilidades
       ------------------------------------------------------ */

    // Fecha de hoy en el navegador con formato AAAA-MM-DD
    function fechaDeHoy() {
        var hoy = new Date();
        var mes = String(hoy.getMonth() + 1).padStart(2, '0');
        var dia = String(hoy.getDate()).padStart(2, '0');
        return hoy.getFullYear() + '-' + mes + '-' + dia;
    }

    // Quita espacios al inicio y al final y junta los espacios repetidos
    function limpiarTexto(texto) {
        return texto.trim().replace(/ {2,}/g, ' ');
    }

    // Lee los valores del formulario ya limpios, listos para validar y enviar
    function leerDatos() {
        return {
            nombre: limpiarTexto(formulario.nombre.value),
            correo: formulario.correo.value.trim(),
            telefono: formulario.telefono.value.trim(),
            fecha_preferida: formulario.fecha_preferida.value,
            banco_id: formulario.banco_id.value,
            acepta_aviso: formulario.acepta_aviso.checked
        };
    }

    /* ------------------------------------------------------
       Mostrar y ocultar errores
       ------------------------------------------------------ */

    // Muestra un mensaje debajo del campo y lo marca como inválido.
    // Se usa textContent (y no innerHTML) para que el texto nunca se
    // interprete como HTML.
    function mostrarError(campo, mensaje) {
        var control = document.getElementById(campo);
        var error = document.getElementById('error-' + campo);

        if (!control || !error) {
            return;
        }

        error.textContent = mensaje;
        error.hidden = false;
        control.setAttribute('aria-invalid', 'true');
    }

    function limpiarError(campo) {
        var control = document.getElementById(campo);
        var error = document.getElementById('error-' + campo);

        if (!control || !error) {
            return;
        }

        error.textContent = '';
        error.hidden = true;
        control.removeAttribute('aria-invalid');
    }

    function limpiarTodosLosErrores() {
        CAMPOS.forEach(limpiarError);
    }

    // Lleva el foco al primer campo con error para corregirlo rápido
    function enfocarPrimerError() {
        var primero = formulario.querySelector('[aria-invalid="true"]');
        if (primero) {
            primero.focus();
        }
    }

    function ocultarMensajes() {
        mensajeExito.hidden = true;
        mensajeError.hidden = true;
    }

    function mostrarMensajeError(texto) {
        mensajeErrorTexto.textContent = texto;
        mensajeError.hidden = false;
        mensajeError.focus();
    }

    /* ------------------------------------------------------
       Validación en el navegador
       Devuelve el mensaje de error del campo o '' si está bien.
       El servidor vuelve a validar todo, esto solo da una
       respuesta más rápida a quien llena el formulario.
       ------------------------------------------------------ */
    function validarCampo(campo, datos) {
        var valor = datos[campo];

        switch (campo) {
            case 'nombre':
                if (valor === '') {
                    return 'El nombre es obligatorio.';
                }
                if (valor.length < 3 || valor.length > 120) {
                    return 'El nombre debe tener entre 3 y 120 caracteres.';
                }
                if (!PATRON_NOMBRE.test(valor)) {
                    return 'El nombre solo puede tener letras, espacios y acentos.';
                }
                return '';

            case 'correo':
                if (valor === '') {
                    return 'El correo es obligatorio.';
                }
                if (valor.length > 150) {
                    return 'El correo no puede tener más de 150 caracteres.';
                }
                if (!PATRON_CORREO.test(valor)) {
                    return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
                }
                return '';

            case 'telefono':
                if (valor === '') {
                    return 'El teléfono es obligatorio.';
                }
                if (!PATRON_TELEFONO.test(valor)) {
                    return 'El teléfono debe tener exactamente 10 dígitos, sin espacios ni guiones.';
                }
                return '';

            case 'fecha_preferida':
                // Si el navegador no entiende la fecha escrita, el valor queda vacío
                if (valor === '') {
                    return 'Elige la fecha en la que te gustaría donar.';
                }
                // Con el formato AAAA-MM-DD, comparar textos equivale a comparar fechas
                if (valor < fechaDeHoy()) {
                    return 'La fecha preferida no puede ser anterior a hoy.';
                }
                return '';

            case 'banco_id':
                if (errorCargaBancos) {
                    return errorCargaBancos;
                }
                if (valor === '') {
                    return 'Selecciona un banco de sangre.';
                }
                return '';

            case 'acepta_aviso':
                if (!valor) {
                    return 'Debes aceptar el Aviso de Privacidad.';
                }
                return '';

            default:
                return '';
        }
    }

    // Valida todos los campos. Devuelve true si no hay errores.
    function validarFormulario(datos) {
        var valido = true;

        CAMPOS.forEach(function (campo) {
            var mensaje = validarCampo(campo, datos);
            if (mensaje) {
                mostrarError(campo, mensaje);
                valido = false;
            } else {
                limpiarError(campo);
            }
        });

        return valido;
    }

    /* ------------------------------------------------------
       Cargar bancos de sangre en el select
       Se agrupan por estado con <optgroup>. La API ya los
       devuelve ordenados por estado y nombre.
       ------------------------------------------------------ */
    function llenarBancos(bancos) {
        selectBancos.innerHTML = '';

        if (bancos.length === 0) {
            errorCargaBancos = 'Por ahora no hay bancos de sangre disponibles.';
            selectBancos.add(new Option('No hay bancos disponibles', ''));
            mostrarError('banco_id', errorCargaBancos);
            return;
        }

        selectBancos.add(new Option('Selecciona un banco de sangre', ''));

        var grupoActual = null;

        bancos.forEach(function (banco) {
            // Cuando cambia el estado se crea un grupo nuevo
            if (!grupoActual || grupoActual.label !== banco.estado) {
                grupoActual = document.createElement('optgroup');
                grupoActual.label = banco.estado;
                selectBancos.appendChild(grupoActual);
            }

            // new Option(texto, valor) crea el <option> sin usar HTML
            grupoActual.appendChild(new Option(banco.nombre + ' (' + banco.ciudad + ')', String(banco.id)));
        });

        selectBancos.disabled = false;
    }

    function cargarBancos() {
        fetch(URL_BANCOS, { headers: { 'Accept': 'application/json' } })
            .then(function (respuesta) {
                if (!respuesta.ok) {
                    throw new Error('Respuesta ' + respuesta.status);
                }
                return respuesta.json();
            })
            .then(llenarBancos)
            .catch(function () {
                errorCargaBancos = 'No pudimos cargar los bancos de sangre. Recarga la página para intentarlo de nuevo.';
                selectBancos.innerHTML = '';
                selectBancos.add(new Option('No se pudieron cargar los bancos', ''));
                mostrarError('banco_id', errorCargaBancos);
            });
    }

    /* ------------------------------------------------------
       Envío del formulario
       ------------------------------------------------------ */
    function bloquearBoton(enviando) {
        botonEnviar.disabled = enviando;
        botonEnviar.setAttribute('aria-busy', enviando ? 'true' : 'false');
        botonEnviar.textContent = enviando ? 'Enviando…' : textoBotonOriginal;
    }

    // Respuesta 201: muestra el mensaje y deja el formulario vacío
    function manejarExito(respuesta) {
        formulario.reset();
        limpiarTodosLosErrores();

        mensajeExitoTexto.textContent = respuesta.mensaje || 'Tu pre-registro quedó guardado.';
        mensajeExito.hidden = false;
        mensajeExito.focus();
    }

    // Respuesta 400: coloca cada error del servidor debajo de su campo
    function manejarErroresServidor(respuesta) {
        var errores = Array.isArray(respuesta.errores) ? respuesta.errores : [];
        var algunoEnCampo = false;

        errores.forEach(function (error) {
            if (CAMPOS.indexOf(error.campo) !== -1) {
                mostrarError(error.campo, error.mensaje);
                algunoEnCampo = true;
            }
        });

        if (algunoEnCampo) {
            enfocarPrimerError();
        } else {
            mostrarMensajeError(respuesta.mensaje || 'Revisa los datos del formulario.');
        }
    }

    function enviarFormulario(datos) {
        bloquearBoton(true);

        fetch(URL_PREREGISTROS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datos)
        })
            .then(function (respuesta) {
                // Se lee el JSON junto con el código de estado. Si el cuerpo
                // no es JSON se usa un objeto vacío.
                return respuesta.json()
                    .catch(function () {
                        return {};
                    })
                    .then(function (cuerpo) {
                        return { estado: respuesta.status, cuerpo: cuerpo };
                    });
            })
            .then(function (resultado) {
                if (resultado.estado === 201) {
                    manejarExito(resultado.cuerpo);
                } else if (resultado.estado === 400) {
                    manejarErroresServidor(resultado.cuerpo);
                } else {
                    mostrarMensajeError(resultado.cuerpo.mensaje || 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.');
                }
            })
            .catch(function () {
                // fetch falla así cuando no hay conexión con el servidor
                mostrarMensajeError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
            })
            .then(function () {
                // Siempre se vuelve a habilitar el botón, haya salido bien o mal
                bloquearBoton(false);
            });
    }

    formulario.addEventListener('submit', function (evento) {
        // Evita que el navegador recargue la página al enviar
        evento.preventDefault();

        ocultarMensajes();

        var datos = leerDatos();

        if (!validarFormulario(datos)) {
            enfocarPrimerError();
            return;
        }

        enviarFormulario(datos);
    });

    /* ------------------------------------------------------
       Revalidación mientras se corrige
       Si un campo ya muestra un error, se revisa de nuevo cada
       vez que cambia para quitar el mensaje en cuanto se corrige.
       ------------------------------------------------------ */
    function revalidarSiTieneError(evento) {
        var campo = evento.target.name;

        if (CAMPOS.indexOf(campo) === -1 || evento.target.getAttribute('aria-invalid') !== 'true') {
            return;
        }

        var mensaje = validarCampo(campo, leerDatos());
        if (mensaje) {
            mostrarError(campo, mensaje);
        } else {
            limpiarError(campo);
        }
    }

    formulario.addEventListener('input', revalidarSiTieneError);
    formulario.addEventListener('change', revalidarSiTieneError);

    /* ------------------------------------------------------
       Inicio
       ------------------------------------------------------ */

    // El calendario no deja elegir días anteriores a hoy
    campoFecha.min = fechaDeHoy();

    cargarBancos();
})();
