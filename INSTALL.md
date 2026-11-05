# Instalación de DonaVida en Windows

Esta guía explica cómo reproducir DonaVida en un equipo con Windows: el sitio informativo, la API en Express.js, la base de datos en MySQL y el acceso por HTTPS con el dominio local `donavida.local` a través de Nginx.

Los comandos de los pasos 1 a 5 están escritos para **PowerShell** y se ejecutan desde la carpeta raíz del proyecto. La sección de dominio local y HTTPS usa el **Símbolo del sistema** (cmd). En cada caso se indica dónde ejecutarlos.

---

## 1. Requisitos

| Programa | Versión usada en el proyecto | Cómo comprobarla |
|---|---|---|
| Node.js | v26.13.0 | `node -v` |
| npm | 11.20.0 (viene con Node.js) | `npm -v` |
| MySQL Community Server | 8.0.18 | `mysql --version` |
| Git para Windows | cualquier versión reciente | `git --version` |
| Nginx para Windows | 1.30.6 | `nginx -v` (desde `C:\nginx`) |
| OpenSSL | 3.2.3 (incluido con Git para Windows en `C:\Program Files\Git\usr\bin\openssl.exe`) | `"C:\Program Files\Git\usr\bin\openssl.exe" version` |

> Si `mysql --version` dice que el comando no existe, MySQL no está en el PATH. Puedes usar la ruta completa, por ejemplo:
> `& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --version`

Para instalar la base de datos necesitas un usuario de MySQL con permisos de administrador, por ejemplo `root`. La aplicación **no** usa ese usuario. Usa uno propio con permisos limitados que se crea en el paso 3.

Esta guía supone que Nginx está descomprimido en `C:\nginx`. **Si Nginx está en otra carpeta, ajusta todas las rutas** que empiezan con `C:\nginx` o `C:/nginx`, incluidas las de `nginx/donavida.conf`.

---

## 2. Dependencias

Las versiones están fijas en `package.json` y `package-lock.json`, sin `^` ni `~`, para que todos instalen exactamente lo mismo.

| Paquete | Versión | Para qué sirve |
|---|---|---|
| express | 5.3.0 | Servidor web. Entrega los archivos de `public/` y atiende las rutas de la API. |
| mysql2 | 3.24.6 | Conexión con MySQL. Se usa su versión con promesas y un pool de conexiones. |
| express-validator | 7.3.2 | Valida y limpia los datos del formulario de pre-registro antes de guardarlos. |
| dotenv | 18.0.9 | Lee la configuración (puerto y datos de MySQL) desde el archivo `.env`. |

---

## 3. Pasos de instalación

### Paso 1. Clonar el repositorio

```powershell
git clone https://github.com/RikHart06/DonaVida.git
cd DonaVida
```

### Paso 2. Instalar las dependencias

```powershell
npm ci
```

`npm ci` instala exactamente las versiones registradas en `package-lock.json`. A diferencia de `npm install`, nunca actualiza ni modifica ese archivo. Si `package.json` y `package-lock.json` no coinciden, se detiene con un error en lugar de instalar otra cosa. Así todos trabajan con las mismas versiones.

Al terminar aparece la carpeta `node_modules/`, que no se sube al repositorio.

### Paso 3. Crear la base de datos con `database/init.sql`

El script crea la base `donavida`, las tablas `bancos_sangre` y `preregistros`, tres bancos de sangre de ejemplo y el usuario `donavida_app`, que solo tiene permisos **SELECT** e **INSERT**.

1. Abre `database/init.sql` con un editor de texto.
2. Busca esta línea casi al final:

   ```sql
   CREATE USER IF NOT EXISTS 'donavida_app'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';
   ```

3. Cambia `CAMBIA_ESTA_CLAVE` por una contraseña propia y segura. Guárdala, porque la necesitarás en el paso 4.
4. Ejecuta el script con tu usuario administrador:

   ```powershell
   mysql -u root -p -e "source database/init.sql"
   ```

   Te pedirá la contraseña de `root`. En PowerShell no funciona `mysql ... < archivo.sql`, por eso se usa `source`.

   También puedes abrir el archivo en **MySQL Workbench** y ejecutarlo con el botón del rayo.

> El script se debe ejecutar **una sola vez**. Las tablas y el usuario usan `IF NOT EXISTS`, pero los bancos de ejemplo se volverían a insertar y quedarían repetidos.

### Paso 4. Crear el archivo `.env`

```powershell
Copy-Item .env.example .env
```

Abre `.env` y llena cada variable:

| Variable | Qué es | Valor habitual |
|---|---|---|
| `PORT` | Puerto donde escucha el servidor de DonaVida. Si no se define, se usa 3000. | `3000` |
| `DB_HOST` | Equipo donde corre MySQL. | `localhost` |
| `DB_PORT` | Puerto de MySQL. | `3306` |
| `DB_USER` | Usuario con el que la app se conecta a MySQL. | `donavida_app` |
| `DB_PASSWORD` | La contraseña que pusiste en `init.sql` en el paso 3. | tu contraseña |
| `DB_NAME` | Nombre de la base de datos. | `donavida` |

Si la contraseña tiene símbolos como `#`, `!` o espacios, escríbela entre comillas dobles, por ejemplo `DB_PASSWORD="mi#clave segura"`.

> `.env` contiene la contraseña, por eso está en `.gitignore` y **nunca** se sube al repositorio. El archivo que sí se comparte es `.env.example`, que no tiene contraseñas reales.

> Nginx envía las visitas a `http://127.0.0.1:3000`. Si cambias `PORT`, cambia también el puerto de `proxy_pass` en la configuración de Nginx.

### Paso 5. Iniciar la aplicación

```powershell
npm start
```

Deja esta ventana abierta mientras uses el sitio. Para detener el servidor, presiona `Ctrl + C` en la misma ventana.

En este punto el sitio ya funciona en http://localhost:3000. La siguiente sección agrega el dominio `donavida.local` con HTTPS.

---

## 4. Dominio local y HTTPS

Nginx recibe las visitas a `https://donavida.local`, se encarga del cifrado HTTPS, agrega los encabezados de seguridad y pasa cada petición a Express en el puerto 3000. Las visitas por `http://` se redirigen automáticamente a `https://`.

Para estos pasos abre el **Símbolo del sistema como administrador**: busca "cmd" en el menú Inicio, clic derecho y "Ejecutar como administrador".

### Paso 1. Agregar el dominio al archivo hosts

1. Abre el **Bloc de notas como administrador** (clic derecho sobre Bloc de notas y "Ejecutar como administrador").
2. En Bloc de notas elige **Archivo > Abrir** y abre `C:\Windows\System32\drivers\etc\hosts`. Cambia el filtro de "Documentos de texto (*.txt)" a "Todos los archivos (*.*)" para que aparezca.
3. Agrega esta línea al final y guarda:

   ```
   127.0.0.1    donavida.local
   ```

   La línea **no debe empezar con `#`**. En el archivo hosts, `#` convierte la línea en comentario y Windows la ignora.

4. Limpia la caché de DNS para que Windows lea el cambio:

   ```cmd
   ipconfig /flushdns
   ```

Para comprobarlo, `ping donavida.local` debe responder desde `127.0.0.1`.

### Paso 2. Generar el certificado autofirmado

Desde el Símbolo del sistema (no desde Git Bash, porque Git Bash cambia el texto `/CN=...` como si fuera una ruta de archivo):

```cmd
mkdir C:\nginx\conf\ssl
cd /d C:\nginx\conf\ssl
"C:\Program Files\Git\usr\bin\openssl.exe" req -x509 -nodes -days 365 -newkey rsa:2048 -keyout donavida.local.key -out donavida.local.crt -subj "/CN=donavida.local" -addext "subjectAltName=DNS:donavida.local"
```

Esto crea dos archivos en `C:\nginx\conf\ssl`:

| Archivo | Qué es |
|---|---|
| `donavida.local.crt` | El certificado público. Es el que se instala en Windows en el paso 5. |
| `donavida.local.key` | La llave privada. **No la compartas ni la copies al proyecto.** |

Qué significa cada parte del comando:

- `-x509` crea un certificado autofirmado en lugar de una solicitud para una autoridad certificadora.
- `-nodes` guarda la llave sin contraseña, para que Nginx pueda leerla al arrancar sin pedir nada.
- `-days 365` hace que el certificado venza en un año.
- `-newkey rsa:2048` genera una llave nueva RSA de 2048 bits.
- `-subj "/CN=donavida.local"` indica el nombre del sitio.
- `-addext "subjectAltName=DNS:donavida.local"` es **obligatorio para Chrome** y Edge. Desde hace años estos navegadores ignoran el `CN` y solo aceptan el certificado si el dominio aparece en `subjectAltName`. Sin esta parte muestran el error `NET::ERR_CERT_COMMON_NAME_INVALID`.

### Paso 3. Configurar Nginx

El archivo `nginx/donavida.conf` del proyecto tiene los dos bloques `server` de DonaVida:

- El primero escucha en el puerto 80 (HTTP) y redirige todo a HTTPS.
- El segundo escucha en el puerto 443 (HTTPS), usa el certificado, agrega los encabezados de seguridad y pasa las visitas a Express.

1. Abre `C:\nginx\conf\nginx.conf` con un editor de texto.
2. Copia los dos bloques `server` de `nginx/donavida.conf` **dentro** del bloque `http { ... }`, antes de su llave de cierre `}`.
3. Guarda el archivo.

En las rutas de Nginx se usan **diagonales normales** (`C:/nginx/conf/ssl/...`), aunque Windows use diagonales invertidas. Con `\` Nginx puede interpretar mal la ruta.

### Paso 4. Probar y aplicar la configuración

Desde el Símbolo del sistema, en la carpeta de Nginx:

```cmd
cd /d C:\nginx
nginx -t
```

`nginx -t` revisa la configuración sin aplicarla. Debe terminar con `syntax is ok` y `test is successful`. Si muestra un error, indica el archivo y la línea que hay que corregir.

Después aplica los cambios:

```cmd
nginx -s reload
```

Si Nginx no estaba corriendo, `nginx -s reload` muestra un error. En ese caso inícialo con:

```cmd
start nginx
```

### Paso 5. Instalar el certificado en Windows

Como el certificado es autofirmado, Windows no confía en él hasta que lo instalas:

1. En el Explorador de archivos abre `C:\nginx\conf\ssl` y haz doble clic en `donavida.local.crt`.
2. Pulsa **Instalar certificado…**
3. Elige **Usuario actual** y pulsa Siguiente.
4. Elige **Colocar todos los certificados en el siguiente almacén**, pulsa **Examinar…** y selecciona **Entidades de certificación raíz de confianza**.
5. Pulsa Siguiente, luego Finalizar, y acepta la advertencia de seguridad que muestra Windows.
6. **Cierra todas las ventanas del navegador** y vuelve a abrirlo, para que lea el certificado nuevo.

Chrome y Edge usan los certificados de Windows. Firefox tiene su propio almacén, así que ahí habría que importarlo aparte desde su configuración.

### Encabezados de seguridad

Nginx agrega estos encabezados a todas las respuestas de `https://donavida.local`:

| Encabezado | Para qué sirve |
|---|---|
| `Strict-Transport-Security` | Le dice al navegador que durante un año solo abra el sitio por HTTPS, aunque alguien escriba `http://`. |
| `Content-Security-Policy` | Solo permite cargar archivos del propio sitio (imágenes también como `data:`). Bloquea estilos y scripts escritos dentro del HTML, plugins, y que otro sitio meta DonaVida en un marco. |
| `X-Content-Type-Options` | Evita que el navegador "adivine" el tipo de un archivo. Por ejemplo, que trate un texto como si fuera un script. |
| `X-Frame-Options` | Impide que otra página muestre DonaVida dentro de un `iframe`, una técnica que se usa para engañar con clics. |
| `Referrer-Policy` | Al ir a otro sitio, solo le comparte el dominio de origen y no la dirección completa de la página. |
| `Permissions-Policy` | Bloquea el uso de la cámara, el micrófono y la ubicación, porque el sitio no los necesita. |

Además, `server_tokens off` oculta la versión de Nginx en las respuestas y en las páginas de error.

> **Advertencia sobre Strict-Transport-Security.** En cuanto abras `https://donavida.local` una vez, el navegador recordará **durante un año** que ese dominio solo abre por HTTPS. Si después quitas HTTPS o el certificado deja de ser válido, el navegador no te dejará entrar ni saltarte la advertencia. Para que lo olvide en Chrome o Edge, abre `chrome://net-internals/#hsts` (o `edge://net-internals/#hsts`), escribe `donavida.local` en "Delete domain security policies" y pulsa Delete.

---

## 5. Cómo verificar que funciona

**1. Mensajes en la consola.** Al ejecutar `npm start` deben aparecer estas dos líneas:

```
Conexión a MySQL correcta (base de datos "donavida" en localhost).
DonaVida está en marcha en http://localhost:3000
```

**2. Ruta de salud.** Abre en el navegador http://localhost:3000/api/salud. Debe responder:

```json
{"estado":"ok","baseDeDatos":"conectada"}
```

Si la base de datos no responde, verás `{"estado":"error","baseDeDatos":"desconectada"}`.

**3. HTTPS con el dominio local.** Abre https://donavida.local. Debe cargar el inicio **sin ninguna advertencia** y con el candado en la barra de direcciones. También debe funcionar https://donavida.local/api/salud.

**4. Redirección de HTTP a HTTPS.** Escribe http://donavida.local (con `http`). El navegador debe cambiar solo a `https://donavida.local`.

**5. Encabezados de seguridad.** En https://donavida.local presiona **F12**, abre la pestaña **Red** y recarga la página con F5. Haz clic en la primera petición (`donavida.local`) y revisa **Encabezados de respuesta**. Deben aparecer los seis encabezados de la tabla anterior. `Server` debe decir solo `nginx`, sin número de versión.

También puedes revisarlos desde el Símbolo del sistema:

```cmd
curl -I https://donavida.local
```

**6. Página de pre-registro.** Abre https://donavida.local/preregistro.html y revisa lo siguiente:

- El menú **Banco de sangre** muestra los bancos de ejemplo agrupados por estado.
- Si envías el formulario vacío, aparece un mensaje en rojo debajo de cada campo.
- El enlace **Aviso de Privacidad** de la casilla se abre en una pestaña nueva, sin perder lo que escribiste.
- Si lo llenas bien y aceptas el Aviso de Privacidad, aparece el mensaje verde "¡Pre-registro guardado!" y el formulario se limpia.

**7. Páginas legales.** En el pie de página de **todas** las páginas deben aparecer los enlaces **Aviso de Privacidad** y **Términos y Condiciones**, y cada uno debe abrir su página.

---

## 6. Estructura de carpetas

```
DonaVida/
├── public/                     Sitio que ve el usuario (se sirve tal cual)
│   ├── index.html              Inicio
│   ├── requisitos.html
│   ├── preguntas.html
│   ├── quiz.html
│   ├── preregistro.html        Formulario de pre-registro
│   ├── aviso-privacidad.html   Aviso de Privacidad
│   ├── terminos.html           Términos y Condiciones
│   ├── css/                    styles.css, preregistro.css y legal.css
│   ├── js/                     main.js, quiz.js y preregistro.js
│   └── img/
├── src/                        Código del servidor
│   ├── db/conexion.js          Pool de conexiones a MySQL
│   ├── rutas/                  salud.js, bancos.js y preregistros.js
│   └── validaciones/           Reglas de express-validator del pre-registro
├── database/init.sql           Script para crear la base de datos
├── nginx/donavida.conf         Bloques server de Nginx para donavida.local
├── server.js                   Punto de entrada del servidor
├── package.json                Datos del proyecto y dependencias
├── package-lock.json           Versiones exactas instaladas
├── .env.example                Plantilla de configuración, sin contraseñas
└── .env                        Configuración real (no se sube a git)
```

Las carpetas `dist/` y el archivo `donavida-v1.0.zip` pertenecen a la versión estática anterior del proyecto y no se usan para ejecutar la aplicación.

El certificado y la llave privada viven en `C:\nginx\conf\ssl` y **no** forman parte del proyecto.

### Rutas de la API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/salud` | Comprueba la conexión con la base de datos. |
| GET | `/api/bancos` | Lista los bancos de sangre activos. |
| POST | `/api/preregistros` | Valida y guarda un pre-registro. |

---

## 7. Problemas comunes

### MySQL está apagado

La consola muestra:

```
No se pudo conectar a MySQL.
  Motivo: MySQL no responde. Revisa que el servicio esté en marcha y que DB_HOST y DB_PORT sean correctos.
  Código: ECONNREFUSED
Atención: el servidor arrancó sin conexión a MySQL. Las funciones de pre-registro no estarán disponibles.
```

El sitio informativo sigue funcionando, pero el pre-registro no. Para solucionarlo, inicia el servicio de MySQL en una ventana de PowerShell **como administrador**. En la mayoría de las instalaciones el servicio se llama `MySQL80`:

```powershell
Get-Service MySQL*
Start-Service MySQL80
```

También puedes iniciarlo desde la aplicación **Servicios** de Windows. Después reinicia DonaVida con `npm start`.

### Contraseña incorrecta

La consola muestra:

```
No se pudo conectar a MySQL.
  Motivo: Usuario o contraseña incorrectos. Revisa DB_USER y DB_PASSWORD.
  Código: ER_ACCESS_DENIED_ERROR
```

Revisa que `DB_PASSWORD` en `.env` sea la misma que pusiste en `init.sql`. Si tiene símbolos, ponla entre comillas dobles. Guarda el archivo y reinicia con `npm start`.

### El puerto 3000 está ocupado

La consola muestra:

```
No se pudo iniciar: el puerto 3000 ya está en uso. Cierra el otro programa o cambia PORT en .env.
```

Suele pasar cuando DonaVida ya está abierto en otra ventana. Tienes dos opciones:

- Cerrar la otra ventana, o buscar qué programa usa el puerto y detenerlo:

  ```powershell
  Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
  Stop-Process -Id <número que aparece en OwningProcess>
  ```

- Usar otro puerto: cambia `PORT=3000` por, por ejemplo, `PORT=3001` en `.env` y abre http://localhost:3001. Si usas Nginx, cambia también el puerto de `proxy_pass` y ejecuta `nginx -s reload`.

### `donavida.local` no responde

El navegador muestra "No se puede acceder a este sitio" o `DNS_PROBE_FINISHED_NXDOMAIN`, y `ping donavida.local` dice que no encuentra el host.

Casi siempre es porque la línea del archivo hosts empieza con `#` y Windows la trata como comentario. Abre el archivo hosts con Bloc de notas como administrador y revisa que la línea sea exactamente:

```
127.0.0.1    donavida.local
```

sin `#` al inicio. Guarda y ejecuta `ipconfig /flushdns`.

### "La conexión no es privada"

El navegador muestra una advertencia con el código `NET::ERR_CERT_AUTHORITY_INVALID`. Significa que el certificado no está instalado como confiable. Repite el paso 5 de la sección de dominio local y HTTPS, y asegúrate de elegir el almacén **Entidades de certificación raíz de confianza**. Después cierra **todas** las ventanas del navegador y vuelve a abrirlo.

Si el código es `NET::ERR_CERT_COMMON_NAME_INVALID`, el certificado se generó sin `subjectAltName`. Genera uno nuevo con el comando completo del paso 2, instálalo y ejecuta `nginx -s reload`.

Por el encabezado Strict-Transport-Security, en este sitio el navegador no ofrece el botón para continuar de todos modos. Hay que corregir el certificado.

### El puerto 80 o 443 está ocupado

`start nginx` no muestra nada, pero el sitio no abre. El archivo `C:\nginx\logs\error.log` muestra un error como este:

```
bind() to 0.0.0.0:443 failed (10013: An attempt was made to access a socket in a way forbidden by its access permissions)
```

(o con el código `10048` y el puerto `80`). Significa que otro programa ya usa ese puerto, por ejemplo IIS, Apache de XAMPP, Skype u otra copia de Nginx. Para saber cuál es, desde el Símbolo del sistema:

```cmd
netstat -ano | findstr ":80 :443"
tasklist /fi "PID eq <número de la última columna>"
```

Cierra ese programa o detén su servicio. Por ejemplo, para detener IIS como administrador:

```cmd
net stop w3svc
```

Después inicia Nginx de nuevo con `start nginx`.

### "502 Bad Gateway"

Nginx funciona, pero no encuentra a Express en el puerto 3000. Revisa que la ventana de `npm start` siga abierta y sin errores.
