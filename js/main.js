/* ==========================================================
   DonaVida - Script principal
   ========================================================== */

// Menú móvil: abre y cierra la navegación en pantallas pequeñas
(function () {
    var boton = document.querySelector('.menu-boton');
    var menu = document.getElementById('menu-principal');

    if (!boton || !menu) {
        return;
    }

    function abrirMenu() {
        menu.classList.add('navegacion--abierta');
        boton.setAttribute('aria-expanded', 'true');
    }

    function cerrarMenu() {
        menu.classList.remove('navegacion--abierta');
        boton.setAttribute('aria-expanded', 'false');
    }

    boton.addEventListener('click', function () {
        if (boton.getAttribute('aria-expanded') === 'true') {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    // Cierra el menú al elegir un enlace
    menu.addEventListener('click', function (evento) {
        if (evento.target.closest('a')) {
            cerrarMenu();
        }
    });

    // Cierra con la tecla Escape y regresa el foco al botón
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
            cerrarMenu();
            boton.focus();
        }
    });
})();

// Imágenes faltantes: las oculta para que se vea el fondo de respaldo
(function () {
    var imagenes = document.querySelectorAll('.marco-imagen img');

    imagenes.forEach(function (imagen) {
        // Por si el error ocurrió antes de que corriera este script
        if (imagen.complete && imagen.naturalWidth === 0) {
            imagen.classList.add('img-faltante');
        }

        imagen.addEventListener('error', function () {
            imagen.classList.add('img-faltante');
        });
    });
})();
