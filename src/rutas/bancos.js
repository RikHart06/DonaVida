/*
 * DonaVida - Ruta de bancos de sangre
 *
 * GET /api/bancos
 * Devuelve los bancos de sangre activos, ordenados por estado y nombre.
 * Se usa para llenar el select del formulario de pre-registro.
 *
 * Respuesta 200 (ejemplo):
 *   [
 *     { "id": 3, "nombre": "Banco de Sangre Demo Bajío", "ciudad": "León", "estado": "Guanajuato" },
 *     ...
 *   ]
 */

const express = require('express');
const { pool } = require('../db/conexion');

const router = express.Router();

// La consulta no recibe valores del usuario, por eso no lleva parámetros.
// Solo se piden las columnas que el navegador necesita.
const SQL_BANCOS_ACTIVOS = `
    SELECT id, nombre, ciudad, estado
    FROM bancos_sangre
    WHERE activo = 1
    ORDER BY estado, nombre
`;

// Express 5 envía automáticamente al manejador de errores cualquier error
// de una función async, así que aquí no hace falta un try/catch.
router.get('/', async (req, res) => {
    const [bancos] = await pool.query(SQL_BANCOS_ACTIVOS);
    res.json(bancos);
});

module.exports = router;
