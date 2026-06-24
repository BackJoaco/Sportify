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
Usuario.hasMany(SuscripcionAbonado, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

SuscripcionAbonado.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Actividad.hasMany(SuscripcionAbonado, {
  foreignKey: {
    name: 'actividad_id',
    allowNull: false
  }
});

SuscripcionAbonado.belongsTo(Actividad, {
  foreignKey: {
    name: 'actividad_id',
    allowNull: false
  }
});

// --- Turnos ---
Actividad.hasMany(Turno, {
  foreignKey: {
    name: 'actividad_id',
    allowNull: false
  }
});

Turno.belongsTo(Actividad, {
  foreignKey: {
    name: 'actividad_id',
    allowNull: false
  }
});

// --- Reservas ---
Usuario.hasMany(Reserva, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Reserva.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Turno.hasMany(Reserva, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

Reserva.belongsTo(Turno, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

// --- Listas de Espera ---
Usuario.hasMany(ListaEspera, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

ListaEspera.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Turno.hasMany(ListaEspera, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

ListaEspera.belongsTo(Turno, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

// --- Pagos ---
Usuario.hasMany(Pago, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Pago.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Reserva.hasMany(Pago, {
  foreignKey: {
    name: 'reserva_id',
    allowNull: true
  }
});

Pago.belongsTo(Reserva, {
  foreignKey: {
    name: 'reserva_id',
    allowNull: true
  }
});

SuscripcionAbonado.hasMany(Pago, {
  foreignKey: {
    name: 'suscripcion_id',
    allowNull: true
  }
});

Pago.belongsTo(SuscripcionAbonado, {
  foreignKey: {
    name: 'suscripcion_id',
    allowNull: true
  }
});

// Alias para empleado
Usuario.hasMany(Pago, {
  foreignKey: {
    name: 'registrado_por_empleado_id',
    allowNull: true
  },
  as: 'PagosCobrados'
});

Pago.belongsTo(Usuario, {
  foreignKey: {
    name: 'registrado_por_empleado_id',
    allowNull: true
  },
  as: 'Empleado'
});

// --- Créditos ---
Usuario.hasMany(Credito, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Credito.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Reserva.hasMany(Credito, {
  foreignKey: {
    name: 'reserva_origen_id',
    allowNull: false
  }
});

Credito.belongsTo(Reserva, {
  foreignKey: {
    name: 'reserva_origen_id',
    allowNull: false
  }
});

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