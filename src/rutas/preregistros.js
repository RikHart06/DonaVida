/*
 * DonaVida - Ruta de pre-registros
 *
 * POST /api/preregistros
 * Recibe en JSON los datos del formulario de pre-registro, los valida y los
 * guarda en la tabla preregistros.
 *
 * Cuerpo esperado (ejemplo):
 *   {
 *     "nombre": "María López",
 *     "correo": "maria@ejemplo.com",
 *     "telefono": "8112345678",
 *     "fecha_preferida": "2026-11-20",
 *     "banco_id": 1,
 *     "acepta_aviso": true
 *   }
 *
 * Respuestas:
 *   201 -> pre-registro guardado, con un mensaje de confirmación
 *   400 -> datos inválidos, con la lista de errores por campo
 *   500 -> error del servidor, con un mensaje general (sin detalles internos)
 */

const express = require('express');
const { matchedData } = require('express-validator');
const { pool } = require('../db/conexion');
const { reglasPreregistro, manejarErroresValidacion } = require('../validaciones/preregistro');

const router = express.Router();

// Consulta parametrizada: cada ? se reemplaza de forma segura por un valor
// del arreglo, así los datos del usuario nunca se mezclan con el SQL.
const SQL_INSERTAR_PREREGISTRO = `
    INSERT INTO preregistros
        (nombre, correo, telefono, fecha_preferida, banco_id, acepta_aviso)
    VALUES (?, ?, ?, ?, ?, ?)
`;

router.post('/', reglasPreregistro, manejarErroresValidacion, async (req, res) => {
    // matchedData devuelve solo los campos validados y ya limpios (sin espacios
    // de sobra, correo en minúsculas, banco_id como número). Cualquier otro
    // campo que venga en la petición se ignora.
    const datos = matchedData(req, { locations: ['body'] });

    // Si la consulta falla, Express 5 manda el error al manejador general
    await pool.execute(SQL_INSERTAR_PREREGISTRO, [
        datos.nombre,
        datos.correo,
        datos.telefono,
        datos.fecha_preferida,
        datos.banco_id,
        datos.acepta_aviso ? 1 : 0
    ]);

    // 201 = Creado
    res.status(201).json({
        // El navegador debe mostrar este texto con textContent (no innerHTML),
        // porque incluye el nombre que escribió el usuario.
        mensaje: `Gracias, ${datos.nombre}. Tu pre-registro quedó guardado.`
    });
});

module.exports = router;
