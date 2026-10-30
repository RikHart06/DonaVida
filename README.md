# DonaVida

**DonaVida** es una guía informativa para personas que quieren donar sangre en México. Reúne en un solo lugar, con lenguaje claro y cercano, lo que necesitas saber antes de acudir a un banco de sangre: quién puede donar, cómo prepararte, en qué consiste el proceso, qué hacer después y dónde acudir. Además incluye un quiz orientativo para saber si podrías ser apto para donar.

## Propósito

Donar sangre salva vidas, pero muchas personas no lo hacen porque no saben si cumplen los requisitos o no conocen el proceso. DonaVida busca resolver esas dudas de forma sencilla para que más personas se animen a donar y lleguen preparadas el día de su donación.

La información es orientativa y se basa en fuentes oficiales mexicanas: la Norma Oficial Mexicana NOM-253-SSA1-2012 (Diario Oficial de la Federación) y el Centro Nacional de la Transfusión Sanguínea (gob.mx/cnts). Los requisitos pueden variar entre bancos de sangre y la decisión final la toma siempre el personal médico del banco de sangre el día de la donación.

## Páginas

- **Inicio** (`index.html`): presentación de la app, botón principal para hacer el quiz, accesos a las demás páginas, la importancia de donar, datos rápidos (duración, cantidad, ayuno y tiempo entre donaciones), un resumen de requisitos con el proceso en 7 pasos y algunas dudas comunes.
- **Requisitos** (`requisitos.html`): requisitos generales, requisitos adicionales para mujeres, aviso de autoexclusión, línea de tiempo del proceso de donación, consejos para antes y después, y la sección "¿Dónde donar?" con enlaces a sitios oficiales y ejemplos de bancos de sangre.
- **Preguntas frecuentes** (`preguntas.html`): acordeón con las dudas más comunes, como cuánto dura la donación, cuánta sangre se extrae, cada cuánto se puede donar, qué llevar, qué comer antes, qué hacer después y si duele.
- **Quiz** (`quiz.html`): cuestionario de una pregunta a la vez, con barra de progreso y botones "Anterior" y "Siguiente". Al terminar muestra uno de tres resultados: "Posiblemente apto", "No apto por ahora" (con los motivos y cuándo volver a intentarlo) o "No apto". Las respuestas no se guardan en ningún lado.

## Estructura de carpetas

```
DonaVida/
├── README.md
├── index.html          Página de inicio
├── requisitos.html     Requisitos, proceso, consejos y dónde donar
├── preguntas.html      Preguntas frecuentes
├── quiz.html           Quiz orientativo
├── css/
│   └── styles.css      Estilos de todo el sitio
├── js/
│   ├── main.js         Menú móvil, acordeón de preguntas y respaldo de imágenes
│   └── quiz.js         Preguntas y lógica del quiz
└── img/                Fotografías de Unsplash y Pexels
    ├── hero-donacion.jpg
    ├── brazo-donante.jpg
    ├── laboratorio.jpg
    ├── voluntarios.jpg
    └── descanso.jpg
```

Las preguntas del quiz están definidas como un arreglo de objetos al inicio de `js/quiz.js`, así que se pueden editar, agregar o quitar sin tocar el resto de la lógica.

## Tecnologías

Sitio web estático hecho únicamente con HTML5, CSS3 y JavaScript puro, sin frameworks. No usa librerías externas, CDN, fuentes externas ni herramientas de compilación. Todas las rutas son relativas, por lo que el sitio funciona tanto en la raíz de un servidor como en una subruta (por ejemplo `http://localhost/donavida/`).

Se cuidó que el sitio sea responsive (móvil, tableta y escritorio) y accesible: etiquetas semánticas, textos alternativos, buen contraste, navegación con teclado y compatibilidad con lectores de pantalla.

## Cómo abrirla localmente

**Opción 1: abrir el archivo directamente**

Abre `index.html` con doble clic o arrástralo a tu navegador. No necesitas instalar nada.

**Opción 2: con un servidor local**

Si tienes Python instalado, desde la carpeta del proyecto ejecuta:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000/` en tu navegador.

**Opción 3: desde una subruta con Nginx**

Copia la carpeta del proyecto dentro del directorio que sirve Nginx con el nombre `donavida` y abre `http://localhost/donavida/`.
