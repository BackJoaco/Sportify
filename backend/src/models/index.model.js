import { sequelize } from '../config/database.js';

import UsuarioModel from './usuario.model.js';
import ActividadModel from './actividad.model.js';
import TurnoModel from './turno.model.js';
import ReservaModel from './reserva.model.js';
import PagoModel from './pago.model.js';
import CreditoModel from './credito.model.js';
import AbonadoTurnoModel from './abonadoTurno.model.js';
import ListaEsperaAbonadoModel from './listaEsperaAbonado.model.js';
import ListaEsperaNoAbonadoModel from './listaEsperaNoAbonado.model.js';
import NotificacionModel from './notificacion.model.js';

const Usuario = UsuarioModel(sequelize);
const Actividad = ActividadModel(sequelize);
const Turno = TurnoModel(sequelize);
const Reserva = ReservaModel(sequelize);
const Pago = PagoModel(sequelize);
const Credito = CreditoModel(sequelize);
const AbonadoTurno = AbonadoTurnoModel(sequelize);
const ListaEsperaAbonado = ListaEsperaAbonadoModel(sequelize);
const ListaEsperaNoAbonado = ListaEsperaNoAbonadoModel(sequelize);
const Notificacion = NotificacionModel(sequelize);

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

// --- Abonados a turnos fijos ---
Usuario.hasMany(AbonadoTurno, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

AbonadoTurno.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Turno.hasMany(AbonadoTurno, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

AbonadoTurno.belongsTo(Turno, {
  foreignKey: {
    name: 'turno_id',
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

// --- Listas de Espera nuevas ---
Usuario.hasMany(ListaEsperaAbonado, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

ListaEsperaAbonado.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Turno.hasMany(ListaEsperaAbonado, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

ListaEsperaAbonado.belongsTo(Turno, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

Usuario.hasMany(ListaEsperaNoAbonado, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

ListaEsperaNoAbonado.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Turno.hasMany(ListaEsperaNoAbonado, {
  foreignKey: {
    name: 'turno_id',
    allowNull: false
  }
});

ListaEsperaNoAbonado.belongsTo(Turno, {
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

AbonadoTurno.hasMany(Pago, {
  foreignKey: {
    name: 'abonado_turno_id',
    allowNull: true
  }
});

Pago.belongsTo(AbonadoTurno, {
  foreignKey: {
    name: 'abonado_turno_id',
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

// --- Notificaciones ---
Usuario.hasMany(Notificacion, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

Notificacion.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  }
});

export {
  Usuario,
  Actividad,
  Turno,
  Reserva,
  Pago,
  Credito,
  AbonadoTurno,
  ListaEsperaAbonado,
  ListaEsperaNoAbonado,
  Notificacion
};
