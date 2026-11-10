-- Script de inicialización de DonaVida
CREATE DATABASE IF NOT EXISTS donavida
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE donavida;

-- Catálogo de bancos de sangre
CREATE TABLE IF NOT EXISTS bancos_sangre (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_bancos_estado (estado)
);

-- Pre-registros de donantes
CREATE TABLE IF NOT EXISTS preregistros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  fecha_preferida DATE NOT NULL,
  banco_id INT NOT NULL,
  acepta_aviso TINYINT(1) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_preregistros_correo (correo),
  INDEX idx_preregistros_fecha (fecha_preferida),
  CONSTRAINT fk_preregistros_banco
    FOREIGN KEY (banco_id) REFERENCES bancos_sangre(id)
);

-- Datos de ejemplo
INSERT INTO bancos_sangre (nombre, ciudad, estado) VALUES
  ('Banco de Sangre Demo Centro', 'Monterrey', 'Nuevo León'),
  ('Banco de Sangre Demo Norte', 'San Nicolás de los Garza', 'Nuevo León'),
  ('Banco de Sangre Demo Bajío', 'León', 'Guanajuato');

-- Usuario de la aplicación con permisos limitados
CREATE USER IF NOT EXISTS 'donavida_app'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';
GRANT SELECT, INSERT ON donavida.* TO 'donavida_app'@'localhost';
FLUSH PRIVILEGES;