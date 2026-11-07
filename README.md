# Serie II - Reserva de salas de biblioteca

Aplicación simple: Node.js + Express + Sequelize + SQLite (backend), React + Vite (frontend), sesiones mediante cookies.

## En Visual Studio Code

Abre la carpeta `serie2-biblioteca` en VS Code. Abre **dos terminales**.

**Terminal 1 (backend):**

```powershell
cd backend
npm install
npm start
```

Al arrancar se crea automáticamente `backend/biblioteca.sqlite` con un usuario y tres salas.

**Terminal 2 (frontend):**

```powershell
cd frontend
npm install
npm run dev
```

Entra en **http://localhost:5173**. Usuario: **admin**. Contraseña: **123456**.

Requiere Node.js instalado. La base SQLite se crea sola; no necesitas instalar un servidor de bases de datos.

## Pruebas para explicar

1. Inicia sesión con `admin / 123456`. Aparecen Sala A, B y C.
2. Reserva Sala A, fecha 2026-11-15, de 10:00 a 11:00. Debe guardarse.
3. En la misma sala y fecha intenta 10:30 a 11:30. Debe devolver **409**, porque las horas se cruzan.
4. Intenta 11:00 a 12:00. Debe permitirse, porque empieza exactamente al terminar la anterior.
5. Reserva la misma hora en Sala B. Se permite (son salas diferentes).
6. Prueba fin 09:00 e inicio 10:00: devuelve **400**.
7. Cierra sesión; al tratar de ir a ruta protegida, el backend devuelve **401**.
8. Para probar caducidad sin esperar 30 minutos, cambia temporalmente `maxAge: 30 * 60 * 1000` por `maxAge: 60 * 1000`, reinicia backend, inicia sesión, espera más de un minuto SIN hacer peticiones y pulsa Reservar. Verás 401 y volverás al login. Luego devuelve el valor a 30 minutos.

## ¿Cómo funciona?

- `backend/modelos.js`: modelos Usuario, Sala y Reserva de Sequelize.
- `backend/index.js`: login/cookies, rutas y validación de solapamientos en transacción.
- `frontend/src/App.jsx`: pantalla de login, salas, formulario y reservas.
- `frontend/vite.config.js`: envía `/api` al servidor local 3001, evitando CORS entre puertos durante desarrollo.
- `decisiones.md`: tres secciones que pide el examen.
- `prompts.md`: solicitudes y límites del uso de IA.

**Regla de solapamiento:** hay conflicto cuando `nuevoInicio < finExistente` y `nuevoFin > inicioExistente`, siempre que sala y fecha coincidan.

**Sesión:** cookie HttpOnly de 30 minutos; `rolling: true` renueva el plazo con cada petición. Si el frontend recibe `401`, vuelve a mostrar el login. Para un ejercicio local se usa `MemoryStore` de Express Session; en producción se recomienda un almacén persistente de sesiones y una clave secreta privada.

## Dos commits y subida al repositorio

Este ZIP ya trae carpeta `.git` y **dos commits** (backend, frontend/documentación). Compruébalo desde la carpeta raíz:

```powershell
git log --oneline
```

Si necesitas subirlo a GitHub, crea un repositorio vacío y enlázalo:

```powershell
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

Para entregar en Canvas, usa la carpeta con nombre `Final-desarrollo-web-CARNET` (sustituye CARNET por tu número), o sube el repositorio según indique el docente.
