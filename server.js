/*
 * DonaVida - Servidor principal
 *
 * Punto de entrada de la aplicación:
 *   - Sirve los archivos estáticos del sitio (HTML, CSS, JS e imágenes) de public/.
 *   - Expone la API en /api: /api/salud, /api/bancos y /api/preregistros.
 *   - Al arrancar prueba la conexión con MySQL y lo informa en la consola.
 */

// Carga las variables de entorno del archivo .env (PORT, DB_HOST, etc.)
// Se hace antes que todo para que el resto del código ya pueda leerlas.
require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');

const { probarConexion } = require('./src/db/conexion');
const rutaSalud = require('./src/rutas/salud');
const rutaBancos = require('./src/rutas/bancos');
const rutaPreregistros = require('./src/rutas/preregistros');

// Puerto donde escuchará el servidor. Si .env no lo define, se usa 3000.
const PUERTO = Number(process.env.PORT) || 3000;

// Carpeta con los archivos públicos del sitio
const CARPETA_PUBLICA = path.join(__dirname, 'public');

const app = express();

// No anunciar en las respuestas que el servidor usa Express
app.disable('x-powered-by');

// ---------- API ----------

// Convierte el cuerpo JSON de las peticiones en req.body.
// El límite de 10 KB es de sobra para un formulario y evita cuerpos enormes.
app.use('/api', express.json({ limit: '10kb' }));

app.use('/api/salud', rutaSalud);
app.use('/api/bancos', rutaBancos);
app.use('/api/preregistros', rutaPreregistros);

// Cualquier ruta de la API que no exista responde en JSON
app.use('/api', (req, res) => {
    res.status(404).json({ mensaje: 'Recurso no encontrado.' });
});

/*
 * Manejador de errores de la API. Express lo reconoce porque recibe 4
 * parámetros. Aquí llegan los errores de las rutas (por ejemplo, si MySQL
 * no responde). El detalle se muestra solo en la consola del servidor y al
 * usuario se le envía un mensaje general, sin información interna.
 */
app.use('/api', (error, req, res, next) => {
    // JSON mal escrito en el cuerpo de la petición
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'Los datos enviados no tienen un formato JSON válido.' });
    }

    // Cuerpo de la petición más grande que el límite
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ mensaje: 'Los datos enviados son demasiado grandes.' });
    }

    console.error(`Error en ${req.method} ${req.originalUrl}:`, error.code || '', error.message);

    return res.status(500).json({
        mensaje: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
    });
});

// ---------- Sitio estático ----------

// Sirve los archivos de public/. Al pedir "/" se entrega public/index.html.
app.use(express.static(CARPETA_PUBLICA));

// Cualquier otra ruta que no exista responde con un 404 sencillo
app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Página no encontrada');
});

// ---------- Arranque ----------

async function iniciar() {
    // Primero se prueba la base de datos para mostrar el resultado en consola.
    // Si falla, el servidor arranca de todos modos: el sitio informativo sigue
    // funcionando y /api/salud indicará que la base de datos no está conectada.
    const conectada = await probarConexion();

    // En Express 5 este callback también se llama si el servidor no pudo
    // arrancar (por ejemplo, si el puerto ya está ocupado). En ese caso
    // recibe el error y se termina el proceso con un mensaje claro.
    app.listen(PUERTO, (error) => {
        if (error) {
            if (error.code === 'EADDRINUSE') {
                console.error(`No se pudo iniciar: el puerto ${PUERTO} ya está en uso. Cierra el otro programa o cambia PORT en .env.`);
            } else {
                console.error('No se pudo iniciar el servidor.', error.message);
            }
            process.exit(1);
        }

        console.log(`DonaVida está en marcha en http://localhost:${PUERTO}`);
        if (!conectada) {
            console.log('Atención: el servidor arrancó sin conexión a MySQL. Las funciones de pre-registro no estarán disponibles.');
        }
    });
}

iniciar();
