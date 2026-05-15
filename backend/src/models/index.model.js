import { sequelize } from '../config/database.js';

import UsuarioModel from './usuario.model.js';
import ActividadModel from './actividad.model.js';
import SuscripcionAbonadoModel from './suscripcionAbonado.model.js';
import TurnoModel from './turno.model.js';
import ReservaModel from './reserva.model.js';
import ListaEsperaModel from './listaEspera.model.js';
import PagoModel from './pago.model.js';
import CreditoModel from './credito.model.js';

const Usuario = UsuarioModel(sequelize);
const Actividad = ActividadModel(sequelize);
const SuscripcionAbonado = SuscripcionAbonadoModel(sequelize);
const Turno = TurnoModel(sequelize);
const Reserva = ReservaModel(sequelize);
const ListaEspera = ListaEsperaModel(sequelize);
const Pago = PagoModel(sequelize);
const Credito = CreditoModel(sequelize);

// --- Suscripciones ---
Usuario.hasMany(SuscripcionAbonado, { foreignKey: 'usuario_id' });
SuscripcionAbonado.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Actividad.hasMany(SuscripcionAbonado, { foreignKey: 'actividad_id' });
SuscripcionAbonado.belongsTo(Actividad, { foreignKey: 'actividad_id' });

// --- Turnos ---
Actividad.hasMany(Turno, { foreignKey: 'actividad_id' });
Turno.belongsTo(Actividad, { foreignKey: 'actividad_id' });

// --- Reservas ---
Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Turno.hasMany(Reserva, { foreignKey: 'turno_id' });
Reserva.belongsTo(Turno, { foreignKey: 'turno_id' });

// --- Listas de Espera ---
Usuario.hasMany(ListaEspera, { foreignKey: 'usuario_id' });
ListaEspera.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Turno.hasMany(ListaEspera, { foreignKey: 'turno_id' });
ListaEspera.belongsTo(Turno, { foreignKey: 'turno_id' });

// --- Pagos ---
Usuario.hasMany(Pago, { foreignKey: 'usuario_id' });
Pago.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Reserva.hasMany(Pago, { foreignKey: 'reserva_id' });
Pago.belongsTo(Reserva, { foreignKey: 'reserva_id' });

SuscripcionAbonado.hasMany(Pago, { foreignKey: 'suscripcion_id' });
Pago.belongsTo(SuscripcionAbonado, { foreignKey: 'suscripcion_id' });

// Alias para empleado
Usuario.hasMany(Pago, {
  foreignKey: 'registrado_por_empleado_id',
  as: 'PagosCobrados'
});

Pago.belongsTo(Usuario, {
  foreignKey: 'registrado_por_empleado_id',
  as: 'Empleado'
});

// --- Créditos ---
Usuario.hasMany(Credito, { foreignKey: 'usuario_id' });
Credito.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Reserva.hasMany(Credito, { foreignKey: 'reserva_origen_id' });
Credito.belongsTo(Reserva, { foreignKey: 'reserva_origen_id' });

export {
  Usuario,
  Actividad,
  SuscripcionAbonado,
  Turno,
  Reserva,
  ListaEspera,
  Pago,
  Credito
};