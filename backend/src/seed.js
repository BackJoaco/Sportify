import { sequelize } from './config/database.js';
import { Actividad, Turno, Usuario } from './models/index.model.js';
import { hashPassword } from './utils/bcrypt.js';

const DEFAULT_PASSWORD = 'Asdasd1.';

const usuariosSeed = [
  {
    nombre: 'Admin',
    apellido: 'Sportify',
    dni: '10000000',
    email: 'admin@sporify.com',
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