/*
 * DonaVida - Ruta de salud del servidor
 *
 * GET /api/salud
 * Sirve para comprobar rápidamente si el servidor y la base de datos funcionan.
 * Ejecuta un SELECT 1 y responde en JSON:
 *   200 -> { "estado": "ok",    "baseDeDatos": "conectada" }
 *   503 -> { "estado": "error", "baseDeDatos": "desconectada" }
 */

const express = require('express');
const { pool } = require('../db/conexion');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ estado: 'ok', baseDeDatos: 'conectada' });
    } catch (error) {
        // El detalle del error solo se muestra en la consola del servidor
        console.error('GET /api/salud: la base de datos no respondió.', error.code || error.message);

        // 503 = Servicio no disponible
        res.status(503).json({ estado: 'error', baseDeDatos: 'desconectada' });
    }
});

module.exports = router;
