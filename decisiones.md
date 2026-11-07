# Decisiones - Serie II

## (a) Qué entendí del problema y qué tablas/modelos planeé

Se requiere una página para reservar salas de una biblioteca. Primero se inicia sesión con cookie; luego se ven las salas y se crea una reserva con sala, fecha, inicio y fin. La misma sala no puede reservarse dos veces en horarios cruzados.

Planeé **Usuario** (id, usuario, claveHash), **Sala** (id, nombre) y **Reserva** (id, salaId, usuarioId, fecha, inicio, fin). Una sala y un usuario pueden tener varias reservas. Elegí SQLite para evitar configurar un servidor adicional.

## (b) Qué partes delegué a la IA y por qué

Pedí ayuda para una base funcional sencilla: estructura de carpetas, modelos Sequelize, rutas Express, formulario en React y lógica de sesión. Esto permite dedicar tiempo a probar las reglas de negocio y explicar qué hace cada archivo. Es importante revisar personalmente cada cambio antes de entregar.

## (c) Qué corregí o qué se debe revisar críticamente

Al revisar la regla de disponibilidad, noté que **no basta con comparar si dos reservas empiezan a la misma hora**. Por ejemplo, una reserva de 10:00 a 11:00 también choca con otra de 10:30 a 11:30. La condición correcta es `inicioNuevo < finExistente && finNuevo > inicioExistente`, que implementé en el **backend**, además de una transacción para que la comprobación y el guardado estén juntos.

También verifiqué que la sesión se renueve por actividad (`rolling: true`) y que el frontend regrese al login cuando el backend responde **401**. Debo demostrar estas comprobaciones ejecutando las pruebas descritas en README.md.
