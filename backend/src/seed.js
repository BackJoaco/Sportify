import { fileURLToPath } from 'url';
import path from 'path';
import { sequelize } from './config/database.js';
import { Actividad } from './models/index.model.js';
import { hashPassword } from './utils/bcrypt.js';

import { DEFAULT_PASSWORD, usuariosSeed, actividadesSeed, turnosSeed } from './seeds/data.js';
import {
  upsertUsuario,
  upsertActividad,
  upsertTurno,
  seedNotificaciones,
  seedUsuarioConCreditos,
  seedDeudores,
  seedHistorialPasado,
  seedTurnosMasivos,
  seedReservasEspecificas,
  seedAbonadosEspecificos,
  seedCreditosCliente1,
  seedColaAbonadosFutbol,
  seedDeudorAbono
} from './seeds/seeders.js';

export async function runSeed(options = { force: false }) {
  await sequelize.authenticate();
  await sequelize.sync({ force: options.force });

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  await sequelize.transaction(async (transaction) => {
    // 1. Usuarios
    for (const usuario of usuariosSeed) {
      await upsertUsuario(usuario, hashedPassword, transaction);
    }

    // 2. Actividades
    for (const actividad of actividadesSeed) {
      await upsertActividad(actividad, transaction);
    }

    const actividades = await Actividad.findAll({ transaction });
    const actividadesPorNombre = new Map(
      actividades.map((actividad) => [actividad.nombre, actividad])
    );

    // 3. Turnos
    for (const turno of turnosSeed) {
      await upsertTurno(turno, actividadesPorNombre, transaction);
    }

    // 4. Seed de casos de prueba
    await seedNotificaciones(transaction);
    await seedUsuarioConCreditos(transaction);
    await seedDeudores(transaction);
    await seedHistorialPasado(transaction);
    await seedTurnosMasivos(hashedPassword, transaction);
    await seedReservasEspecificas(transaction);
    await seedAbonadosEspecificos(transaction);
    await seedCreditosCliente1(transaction);
    await seedColaAbonadosFutbol(transaction);
    await seedDeudorAbono(transaction);
  });

  console.log('Seed ejecutado correctamente.');
  console.log(`Contraseña temporal para todos los usuarios: ${DEFAULT_PASSWORD}`);
}

const isMain = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isMain) {
  runSeed({ force: false })
    .catch((error) => {
      console.error('Error ejecutando el seed:');
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await sequelize.close();
    });
}