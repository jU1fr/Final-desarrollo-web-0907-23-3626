# Decisiones del proyecto – Sistema de Reservas de Biblioteca

## 1. Comprensión del problema y modelos utilizados

Entendí que el objetivo del proyecto era desarrollar una aplicación web para administrar las reservas de salas de una biblioteca. El sistema debía permitir que un usuario iniciara sesión, visualizara las salas disponibles y realizara reservas indicando la fecha, hora de inicio y hora de finalización.

Para desarrollar el proyecto utilicé Node.js y Express en el backend, Sequelize como herramienta para manejar la base de datos SQLite y React para construir la interfaz del usuario.

Se contemplaron tres modelos principales:

- **Usuario:** almacena la información necesaria para iniciar sesión.
- **Sala:** registra las salas disponibles de la biblioteca.
- **Reserva:** almacena la sala seleccionada, la fecha, la hora de inicio, la hora de finalización y el usuario que realizó la reserva.

Una de las reglas más importantes fue evitar que una sala tuviera dos reservas con horarios que se cruzaran. Por esta razón, la validación se realizó desde el backend.

También se implementó el manejo de sesiones mediante cookies, con una duración de 30 minutos de inactividad.

## 2. Partes delegadas a la inteligencia artificial y por qué

Utilicé ChatGPT como herramienta de apoyo durante el desarrollo de la aplicación.

Las principales tareas en las que solicité ayuda fueron:

- Crear la estructura inicial del proyecto, separando el backend del frontend.
- Generar el código de Node.js, Express y Sequelize para administrar usuarios, salas y reservas.
- Desarrollar la interfaz con React, incluyendo el inicio de sesión y el formulario de reservas.
- Implementar la validación de horarios para evitar reservas solapadas.
- Explicar los comandos necesarios para instalar dependencias y ejecutar ambos servidores desde Visual Studio Code.
- Mejorar la presentación visual mediante CSS, utilizando un diseño moderno y adaptable a distintos tamaños de pantalla.

Decidí utilizar inteligencia artificial para facilitar la organización del código, comprender mejor las tecnologías utilizadas y reducir el tiempo de desarrollo. Sin embargo, también realicé pruebas manuales para comprobar el funcionamiento de la aplicación.

## 3. Error de la inteligencia artificial y corrección realizada

Durante las pruebas encontré un problema al iniciar el frontend. Aunque el servidor de React estaba funcionando, la página aparecía completamente en blanco.

Para identificar el problema abrí las herramientas de desarrollador de Google Chrome y revisé la consola. Allí apareció el error:

`Uncaught ReferenceError: React is not defined`

El problema se encontraba en el archivo `App.jsx`, ya que faltaba importar React correctamente.

Para solucionarlo agregué la siguiente línea al inicio del archivo:

`import React from 'react';`

Después guardé los cambios y actualicé el navegador. La aplicación comenzó a mostrar correctamente el formulario de inicio de sesión.

Posteriormente comprobé que podía ingresar con el usuario de prueba, visualizar las salas y registrar reservas. También probé realizar una segunda reserva en un horario ocupado y el sistema la rechazó correctamente.

**Reflexión:** Esta experiencia me permitió comprender que el código generado por inteligencia artificial no siempre funciona correctamente desde el primer intento. Es necesario revisar los errores, analizar sus causas y realizar pruebas para comprobar que la solución cumple con los requisitos solicitados.