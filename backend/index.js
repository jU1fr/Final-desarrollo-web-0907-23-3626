const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Op, Transaction } = require('sequelize');
const { sequelize, Usuario, Sala, Reserva } = require('./modelos');

const app = express();
app.use(express.json());

// La cookie se renueva con cada petición (30 minutos sin peticiones = caduca).
app.use(session({
  name: 'biblioteca.sid',
  secret: 'clave-de-demostracion-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 30 * 60 * 1000 }
}));

function requiereLogin(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'Sesión vencida. Inicia sesión.' });
  }
  next();
}

app.post('/api/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    const encontrado = await Usuario.findOne({ where: { usuario: usuario || '' } });
    if (!encontrado || !(await bcrypt.compare(contrasena || '', encontrado.claveHash))) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }
    // Regenera el ID para evitar reutilizar una sesión previa.
    req.session.regenerate((error) => {
      if (error) return res.status(500).json({ error: 'No se pudo iniciar sesión.' });
      req.session.usuarioId = encontrado.id;
      req.session.usuario = encontrado.usuario;
      res.json({ id: encontrado.id, usuario: encontrado.usuario });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

app.post('/api/logout', requiereLogin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('biblioteca.sid');
    res.json({ mensaje: 'Sesión cerrada.' });
  });
});

app.get('/api/yo', requiereLogin, (req, res) => {
  res.json({ id: req.session.usuarioId, usuario: req.session.usuario });
});

app.get('/api/salas', requiereLogin, async (req, res) => {
  try {
    res.json(await Sala.findAll({ order: [['id', 'ASC']] }));
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las salas.' });
  }
});

app.get('/api/reservas', requiereLogin, async (req, res) => {
  try {
    const datos = await Reserva.findAll({
      include: [{ model: Sala, attributes: ['nombre'] }],
      order: [['fecha', 'ASC'], ['inicio', 'ASC']]
    });
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar las reservas.' });
  }
});

app.post('/api/reservas', requiereLogin, async (req, res) => {
  const { salaId, fecha, inicio, fin } = req.body;
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
  const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;
  const fechaReal = typeof fecha === 'string' && formatoFecha.test(fecha) &&
    !Number.isNaN(Date.parse(fecha + 'T12:00:00Z')) &&
    new Date(fecha + 'T12:00:00Z').toISOString().slice(0, 10) === fecha;

  if (!Number.isInteger(Number(salaId)) || !fechaReal ||
      !formatoHora.test(inicio || '') || !formatoHora.test(fin || '') || inicio >= fin) {
    return res.status(400).json({ error: 'Revisa sala, fecha y horas (inicio debe ser menor que fin).' });
  }

  try {
    const sala = await Sala.findByPk(Number(salaId));
    if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });

    // REGLA DE NEGOCIO EN EL BACKEND, dentro de una transacción.
    const reserva = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE }, async (t) => {
      // Hay cruce si nuevo inicio < fin existente Y nuevo fin > inicio existente.
      const ocupada = await Reserva.findOne({
        where: {
          salaId: Number(salaId), fecha,
          inicio: { [Op.lt]: fin },
          fin: { [Op.gt]: inicio }
        },
        transaction: t
      });
      if (ocupada) {
        const error = new Error('La sala ya está reservada en ese horario.');
        error.status = 409;
        throw error;
      }
      return Reserva.create({
        salaId: Number(salaId), usuarioId: req.session.usuarioId,
        fecha, inicio, fin
      }, { transaction: t });
    });
    res.status(201).json({ mensaje: 'Reserva creada.', reserva });
  } catch (error) {
    if (error.status === 409) return res.status(409).json({ error: error.message });
    console.error(error);
    res.status(500).json({ error: 'No se pudo guardar la reserva.' });
  }
});

async function iniciar() {
  await sequelize.sync();
  if (!(await Usuario.findOne({ where: { usuario: 'admin' } }))) {
    await Usuario.create({ usuario: 'admin', claveHash: await bcrypt.hash('123456', 10) });
  }
  if (await Sala.count() === 0) {
    await Sala.bulkCreate([
      { nombre: 'Sala A' },
      { nombre: 'Sala B' },
      { nombre: 'Sala C' }
    ]);
  }
  app.listen(3001, () => console.log('Backend listo: http://localhost:3001'));
}

iniciar().catch(console.error);
