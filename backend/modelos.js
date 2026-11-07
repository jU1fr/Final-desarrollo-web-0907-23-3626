const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// SQLite crea automáticamente el archivo biblioteca.sqlite.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'biblioteca.sqlite'),
  logging: false
});

const Usuario = sequelize.define('Usuario', {
  usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
  claveHash: { type: DataTypes.STRING, allowNull: false }
});

const Sala = sequelize.define('Sala', {
  nombre: { type: DataTypes.STRING, allowNull: false }
});

// Fecha y horas como texto ISO: YYYY-MM-DD y HH:mm para compararlas fácilmente.
const Reserva = sequelize.define('Reserva', {
  fecha: { type: DataTypes.STRING(10), allowNull: false },
  inicio: { type: DataTypes.STRING(5), allowNull: false },
  fin: { type: DataTypes.STRING(5), allowNull: false }
});

Reserva.belongsTo(Sala, { foreignKey: { name: 'salaId', allowNull: false } });
Sala.hasMany(Reserva, { foreignKey: 'salaId' });
Reserva.belongsTo(Usuario, { foreignKey: { name: 'usuarioId', allowNull: false } });
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });

module.exports = { sequelize, Usuario, Sala, Reserva };
