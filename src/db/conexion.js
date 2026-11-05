/*
 * DonaVida - Conexión a MySQL
 *
 * Crea un "pool" de conexiones con mysql2/promise. Un pool mantiene varias
 * conexiones abiertas y las reutiliza, así no hay que abrir y cerrar una
 * conexión nueva en cada petición. Todas las consultas de la app usan este pool.
 *
 * Los datos de conexión se leen del archivo .env (ver .env.example).
 */

const mysql = require('mysql2/promise');

// Variables de entorno que el pool necesita para conectarse
const VARIABLES_REQUERIDAS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

// Avisa en consola si falta alguna variable, para detectar un .env incompleto
const faltantes = VARIABLES_REQUERIDAS.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
    console.warn(`Aviso: faltan estas variables en .env: ${faltantes.join(', ')}`);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Juego de caracteres que acepta acentos, ñ y cualquier carácter Unicode
    charset: 'utf8mb4',

    // Si todas las conexiones están ocupadas, la petición espera su turno
    waitForConnections: true,
    // Máximo de conexiones abiertas al mismo tiempo
    connectionLimit: 10,
    // 0 significa que no hay límite de peticiones en espera
    queueLimit: 0,

    // Devuelve las columnas DATE como texto 'AAAA-MM-DD' en lugar de objetos
    // Date, para evitar cambios de día por la zona horaria
    dateStrings: true
});

/*
 * Traduce los errores más comunes de MySQL a un mensaje claro en español.
 * Solo se usa en la consola del servidor, nunca se envía al navegador.
 */
function describirError(error) {
    switch (error.code) {
        case 'ECONNREFUSED':
            return 'MySQL no responde. Revisa que el servicio esté en marcha y que DB_HOST y DB_PORT sean correctos.';
        case 'ENOTFOUND':
            return 'No se encontró el servidor indicado en DB_HOST.';
        case 'ER_ACCESS_DENIED_ERROR':
            return 'Usuario o contraseña incorrectos. Revisa DB_USER y DB_PASSWORD.';
        case 'ER_DBACCESS_DENIED_ERROR':
            return 'El usuario no tiene permiso sobre la base de datos indicada en DB_NAME.';
        case 'ER_BAD_DB_ERROR':
            return 'La base de datos indicada en DB_NAME no existe. Ejecuta database/init.sql.';
        default:
            return 'Error inesperado al conectar con MySQL.';
    }
}

/*
 * Prueba la conexión pidiendo una conexión al pool y ejecutando un SELECT 1.
 * Devuelve true si funcionó o false si hubo un error. Nunca lanza excepciones,
 * así el servidor puede arrancar aunque MySQL no esté disponible.
 */
async function probarConexion() {
    try {
        await pool.query('SELECT 1');
        console.log(`Conexión a MySQL correcta (base de datos "${process.env.DB_NAME}" en ${process.env.DB_HOST}).`);
        return true;
    } catch (error) {
        console.error('No se pudo conectar a MySQL.');
        console.error(`  Motivo: ${describirError(error)}`);
        console.error(`  Código: ${error.code || 'desconocido'}`);
        return false;
    }
}

module.exports = { pool, probarConexion };
