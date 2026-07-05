import { sequelize } from './config/database.js';
import { Actividad, Turno, Usuario, Reserva, Credito, Notificacion, AbonadoTurno } from './models/index.model.js';

import { hashPassword } from './utils/bcrypt.js';

const DEFAULT_PASSWORD = 'Asdasd1.';

const usuariosSeed = [
  {
    nombre: 'Admin',
    apellido: 'Sportify',
    dni: '10000000',
    email: 'admin@sportify.com',
    rol: 'ADMINISTRADOR',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Lucia',
    apellido: 'Gomez',
    dni: '10000001',
    email: 'cliente1@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Martin',
    apellido: 'Perez',
    dni: '10000002',
    email: 'cliente2@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Sofia',
    apellido: 'Lopez',
    dni: '10000003',
    email: 'cliente3@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Diego',
    apellido: 'Fernandez',
    dni: '10000004',
    email: 'cliente4@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Camila',
    apellido: 'Suarez',
    dni: '10000005',
    email: 'empleado1@sportify.com',
    rol: 'EMPLEADO',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Nicolas',
    apellido: 'Romero',
    dni: '10000006',
    email: 'empleado2@sportify.com',
    rol: 'EMPLEADO',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Tomás',
    apellido: 'Rios',
    dni: '10000007',
    email: 'creditos@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  }
];

const actividadesSeed = [
  {
    nombre: 'Futbol',
    precio_clase: 12000,
    precio_mensual: 42000
  },
  {
    nombre: 'Tenis',
    precio_clase: 15000,
    precio_mensual: 50000
  },
  {
    nombre: 'Padel',
    precio_clase: 14000,
    precio_mensual: 47000
  },
  {
    nombre: 'Voley',
    precio_clase: 10000,
    precio_mensual: 36000
  }
];

const turnosSeed = [
  {
    actividadNombre: 'Futbol',
    entrenador: 'Juan Perez',
    dia_semana: 'LUNES',
    hora_inicio: '08:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Tenis',
    entrenador: 'Marta Diaz',
    dia_semana: 'MARTES',
    hora_inicio: '09:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Padel',
    entrenador: 'Lucas Medina',
    dia_semana: 'MIERCOLES',
    hora_inicio: '08:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Voley',
    entrenador: 'Carla Torres',
    dia_semana: 'JUEVES',
    hora_inicio: '09:00:00',
    cupo_maximo: 2
  }
];

async function upsertUsuario(usuarioData, hashedPassword, transaction) {
  await Usuario.upsert(
    {
      ...usuarioData,
      contrasena: hashedPassword
    },
    { transaction }
  );
}

async function upsertActividad(actividadData, transaction) {
  await Actividad.upsert(actividadData, { transaction });
}

async function upsertTurno(turnoData, actividadesPorNombre, transaction) {
  const actividad = actividadesPorNombre.get(turnoData.actividadNombre);

  if (!actividad) {
    throw new Error(`No se encontró la actividad ${turnoData.actividadNombre}`);
  }

  const turnoExistente = await Turno.findOne({
    where: { actividad_id: actividad.id },
    transaction
  });

  const payload = {
    actividad_id: actividad.id,
    entrenador: turnoData.entrenador,
    dia_semana: turnoData.dia_semana,
    hora_inicio: turnoData.hora_inicio,
    cupo_maximo: turnoData.cupo_maximo
  };

  if (turnoExistente) {
    await turnoExistente.update(payload, { transaction });
    return;
  }

  await Turno.create(payload, { transaction });
}

async function runSeed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  await sequelize.transaction(async (transaction) => {
    for (const usuario of usuariosSeed) {
      await upsertUsuario(usuario, hashedPassword, transaction);
    }

    for (const actividad of actividadesSeed) {
      await upsertActividad(actividad, transaction);
    }

    const actividades = await Actividad.findAll({ transaction });
    const actividadesPorNombre = new Map(
      actividades.map((actividad) => [actividad.nombre, actividad])
    );

    for (const turno of turnosSeed) {
      await upsertTurno(turno, actividadesPorNombre, transaction);
    }

    // Seed Notificaciones de prueba
    const admin = await Usuario.findOne({ where: { email: 'admin@sportify.com' }, transaction });

    if (admin) {
      await Notificacion.create({
        usuario_id: admin.id,
        mensaje: 'Bienvenido al panel de administración. Aquí podrás gestionar actividades, turnos y usuarios.',
        leida: false,
        fecha_creacion: new Date()
      }, { transaction });
    }

    const usuarioConCreditos = await Usuario.findOne({
      where: { email: 'creditos@sportify.com' },
      transaction
    });

    const unTurno = await Turno.findOne({ transaction });

    if (usuarioConCreditos && unTurno) {

      await AbonadoTurno.findOrCreate({
        where: {
          usuario_id: usuarioConCreditos.id,
          turno_id: unTurno.id,
          mes_anio: 7 // Suponiendo julio, ajustalo si es necesario
        },
        defaults: {
          fecha_alta: new Date(),
          cancelaciones_mes: 1, // Le sumamos 1 cancelación por la que generó el crédito
          pierde_descuento: false // Todavía no llegó a las 3 cancelaciones de la Regla 3
        },
        transaction
      });
      // 1. Creamos una reserva base (necesaria por la FK de la tabla creditos)
      const [reservaOrigen] = await Reserva.findOrCreate({
        where: { 
          usuario_id: usuarioConCreditos.id,
          turno_id: unTurno.id,
          fecha: '2026-06-15'
        },
        defaults: {
          tipo_reserva: 'ABONADO',
          estado: 'CANCELADA',
          estado_pago: 'PAGADO_COMPLETO',
          codigo_qr: 'QR-SEED-PROBANDO-CREDITOS'
        },
        transaction
      });

      // Calcular fechas de vencimiento
      const fechaVencimientoFutura = new Date();
      fechaVencimientoFutura.setDate(fechaVencimientoFutura.getDate() + 15); // Vence en 15 días

      const fechaVencimientoPasada = new Date();
      fechaVencimientoPasada.setDate(fechaVencimientoPasada.getDate() - 5); // Venció hace 5 días

      // 2. Insertamos un crédito DISPONIBLE si no existe
      await Credito.findOrCreate({
        where: { 
          usuario_id: usuarioConCreditos.id,
          estado: 'DISPONIBLE'
        },
        defaults: {
          fecha_vencimiento: fechaVencimientoFutura
        },
        transaction
      });

      // 3. Insertamos un crédito ya VENCIDO para probar filtros del historial
      await Credito.findOrCreate({
        where: { 
          usuario_id: usuarioConCreditos.id,
          estado: 'VENCIDO'
        },
        defaults: {
          fecha_vencimiento: fechaVencimientoPasada
        },
        transaction
      });
    }

  });

  console.log('Seed ejecutado correctamente.');
  console.log(`Contraseña temporal para todos los usuarios: ${DEFAULT_PASSWORD}`);
}

runSeed()
  .catch((error) => {
    console.error('Error ejecutando el seed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await sequelize.close();
  });