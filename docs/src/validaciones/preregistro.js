/*
 * DonaVida - Validaciones del pre-registro
 *
 * Reglas de express-validator para POST /api/preregistros.
 * Cada campo se revisa en orden y con .bail() se detiene en el primer error,
 * así cada campo devuelve un solo mensaje claro en español.
 *
 * Exporta:
 *   - reglasPreregistro: arreglo de validaciones que se pone antes de la ruta.
 *   - manejarErroresValidacion: middleware que responde 400 si hubo errores.
 */

const { body, validationResult } = require('express-validator');
const { pool } = require('../db/conexion');

// Solo letras (con acentos, diéresis y ñ) y espacios. Ni números ni símbolos.
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

// Exactamente 10 dígitos, sin espacios, guiones ni lada internacional
const PATRON_TELEFONO = /^\d{10}$/;

// La fecha de "hoy" se calcula con la hora de México, sin importar
// en qué zona horaria esté configurado el servidor.
const ZONA_HORARIA = 'America/Mexico_City';

/*
 * Devuelve la fecha de hoy como texto 'AAAA-MM-DD'.
 * El formato 'en-CA' de Intl produce justo ese orden (año-mes-día).
 */
function fechaDeHoy() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONA_HORARIA,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}

const reglasPreregistro = [
    // ---------- nombre ----------
    body('nombre')
        .exists({ values: 'falsy' }).withMessage('El nombre es obligatorio.').bail()
        .isString().withMessage('El nombre debe ser texto.').bail()
        // Quita espacios al inicio y al final y junta los espacios repetidos
        .trim()
        .customSanitizer((valor) => valor.replace(/ {2,}/g, ' '))
        .notEmpty().withMessage('El nombre es obligatorio.').bail()
        .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres.').bail()
        .matches(PATRON_NOMBRE).withMessage('El nombre solo puede tener letras, espacios y acentos.'),

    // ---------- correo ----------
    body('correo')
        .exists({ values: 'falsy' }).withMessage('El correo es obligatorio.').bail()
        .isString().withMessage('El correo debe ser texto.').bail()
        .trim()
        .notEmpty().withMessage('El correo es obligatorio.').bail()
        .isLength({ max: 150 }).withMessage('El correo no puede tener más de 150 caracteres.').bail()
        .isEmail().withMessage('Escribe un correo válido, por ejemplo nombre@dominio.com.').bail()
        // Se guarda en minúsculas para que el mismo correo siempre se vea igual
        .toLowerCase(),

    // ---------- telefono ----------
    body('telefono')
        .exists({ values: 'falsy' }).withMessage('El teléfono es obligatorio.').bail()
        .isString().withMessage('El teléfono debe ser texto.').bail()
        .trim()
        .notEmpty().withMessage('El teléfono es obligatorio.').bail()
        .matches(PATRON_TELEFONO).withMessage('El teléfono debe tener exactamente 10 dígitos, sin espacios ni guiones.'),

    // ---------- fecha_preferida ----------
    body('fecha_preferida')
        .exists({ values: 'falsy' }).withMessage('La fecha preferida es obligatoria.').bail()
        .isString().withMessage('La fecha preferida debe ser texto.').bail()
        .trim()
        // strictMode exige el formato exacto AAAA-MM-DD y rechaza fechas
        // que no existen, como 2026-02-30
        .isDate({ format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-'] })
        .withMessage('Escribe una fecha válida con el formato AAAA-MM-DD.').bail()
        // Con el formato AAAA-MM-DD, comparar los textos equivale a comparar fechas
        .custom((valor) => valor >= fechaDeHoy())
        .withMessage('La fecha preferida no puede ser anterior a hoy.'),

    // ---------- banco_id ----------
    body('banco_id')
        .exists({ values: 'falsy' }).withMessage('Selecciona un banco de sangre.').bail()
        // Acepta 3 o "3", pero no 3.5, "3abc" ni números negativos
        .isInt({ min: 1 }).withMessage('El banco de sangre seleccionado no es válido.').bail()
        .toInt()
        // Revisa en la base de datos que el banco exista y esté activo.
        // El id va como parámetro (?) y nunca se concatena en el SQL.
        .custom(async (bancoId, { req }) => {
            let filas;
            try {
                [filas] = await pool.execute(
                    'SELECT id FROM bancos_sangre WHERE id = ? AND activo = 1',
                    [bancoId]
                );
            } catch (error) {
                // Si la base de datos falla, no es culpa del usuario. Se guarda
                // el error para que manejarErroresValidacion responda con un 500.
                req.errorBaseDatos = error;
                throw new Error('No se pudo verificar el banco de sangre.');
            }

            if (filas.length === 0) {
                throw new Error('El banco de sangre seleccionado no existe o no está disponible.');
            }
            return true;
        }),

    // ---------- acepta_aviso ----------
    body('acepta_aviso')
        .exists().withMessage('Debes aceptar el Aviso de Privacidad.').bail()
        // Se acepta el booleano true (JSON) o el texto "true"
        .custom((valor) => valor === true || valor === 'true')
        .withMessage('Debes aceptar el Aviso de Privacidad.').bail()
        .customSanitizer(() => true)
];

/*
 * Middleware que va después de las reglas. Si alguna falló responde 400 con
 * la lista de errores, un mensaje por campo:
 *   {
 *     "mensaje": "Revisa los datos del formulario.",
 *     "errores": [ { "campo": "telefono", "mensaje": "El teléfono debe tener..." } ]
 *   }
 * Si no hubo errores, pasa a la ruta con next().
 */
function manejarErroresValidacion(req, res, next) {
    // Un fallo de la base de datos durante la validación es un error del
    // servidor, no del usuario: se envía al manejador de errores general.
    if (req.errorBaseDatos) {
        return next(req.errorBaseDatos);
    }

    const resultado = validationResult(req);
    if (resultado.isEmpty()) {
        return next();
    }

    // onlyFirstError deja un solo mensaje por campo
    const errores = resultado.array({ onlyFirstError: true }).map((error) => ({
        campo: error.path,
        mensaje: error.msg
    }));

    return res.status(400).json({
        mensaje: 'Revisa los datos del formulario.',
        errores
    });
}

module.exports = { reglasPreregistro, manejarErroresValidacion };
