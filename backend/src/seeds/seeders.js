import { Actividad, Turno, Usuario, Reserva, Credito, Notificacion, AbonadoTurno, Pago } from '../models/index.model.js';

export async function upsertUsuario(usuarioData, hashedPassword, transaction) {
  await Usuario.upsert(
    {
      ...usuarioData,
      contrasena: hashedPassword
    },
    { transaction }
  );
}

export async function upsertActividad(actividadData, transaction) {
  await Actividad.upsert(actividadData, { transaction });
}

export async function upsertTurno(turnoData, actividadesPorNombre, transaction) {
  const actividad = actividadesPorNombre.get(turnoData.actividadNombre);

  if (!actividad) {
    throw new Error(`No se encontró la actividad ${turnoData.actividadNombre}`);
  }

  const turnoExistente = await Turno.findOne({
    where: { 
      actividad_id: actividad.id,
      dia_semana: turnoData.dia_semana,
      hora_inicio: turnoData.hora_inicio
    },
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

export async function seedNotificaciones(transaction) {
  const admin = await Usuario.findOne({ where: { email: 'admin@sportify.com' }, transaction });

  if (admin) {
    await Notificacion.create({
      usuario_id: admin.id,
      mensaje: 'Bienvenido al panel de administración. Aquí podrás gestionar actividades, turnos y usuarios.',
      leida: false,
      createdAt: new Date()
    }, { transaction });
  }
}

export async function seedUsuarioConCreditos(transaction) {
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
}

export async function seedDeudores(transaction) {
  // CASO 1: El deudor real (Debería aparecer en la lista)
  const deudorPrueba = await Usuario.findOne({ where: { email: 'deudor@sportify.com' }, transaction });
  if (deudorPrueba) {
    await Pago.findOrCreate({
      where: {
        usuario_id: deudorPrueba.id,
        tipo_pago: 'SENA',
        estado: 'PENDIENTE'
      },
      defaults: {
        monto: 12000,
        metodo_pago: null
      },
      transaction
    });
  }

  // CASO 2: El usuario al que le debemos plata (NO debería aparecer en la lista)
  const acreedorPrueba = await Usuario.findOne({ where: { email: 'acreedor@sportify.com' }, transaction });
  if (acreedorPrueba) {
    await Pago.findOrCreate({
      where: {
        usuario_id: acreedorPrueba.id,
        tipo_pago: 'DEVOLUCION_SENA',
        estado: 'PENDIENTE'
      },
      defaults: {
        monto: 15000,
        metodo_pago: null
      },
      transaction
    });
  }
}

export async function seedHistorialPasado(transaction) {
  // --- NUEVO REQUERIMIENTO: Usuario con historial en el pasado ---
  const usuarioHistorial = await Usuario.findOne({ where: { email: 'historial@sportify.com' }, transaction });
  const unTurno = await Turno.findOne({ transaction });

  if (usuarioHistorial && unTurno) {

    // Buscar 2 fechas pasadas (últimos 30 días) que coincidan con el día de la semana del turno
    const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const targetDay = DIAS_SEMANA.indexOf(unTurno.dia_semana.toUpperCase());
    const pastDates = [];
    const today = new Date();

    for (let i = 1; i <= 35; i++) { // buscamos hasta 35 días atrás para asegurar encontrar 2 fechas
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === targetDay) {
        pastDates.push(d.toISOString().split('T')[0]);
        if (pastDates.length === 2) break;
      }
    }

    const fechaReservaAbonado = pastDates[0] || '2026-06-20';
    const fechaReservaIndividual = pastDates[1] || '2026-06-10';

    // Calculamos a qué mes_anio pertenece la fechaReservaAbonado (según lógica Sportify)
    const refDate = new Date(`${fechaReservaAbonado}T12:00:00Z`);
    const day = refDate.getDate();
    const jsMonth = refDate.getMonth();
    const mesAbono = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

    // 1. Abonado en un período anterior coincidente con la fecha
    await AbonadoTurno.findOrCreate({
      where: {
        usuario_id: usuarioHistorial.id,
        turno_id: unTurno.id,
        mes_anio: mesAbono
      },
      defaults: {
        fecha_alta: new Date(`${fechaReservaAbonado}T12:00:00Z`),
        cancelaciones_mes: 0,
        pierde_descuento: false,
        estado: 'ACTIVO'
      },
      transaction
    });

    // 2. Reservas de ese abono en el pasado
    await Reserva.findOrCreate({
      where: {
        usuario_id: usuarioHistorial.id,
        turno_id: unTurno.id,
        fecha: fechaReservaAbonado
      },
      defaults: {
        tipo_reserva: 'ABONADO',
        estado: 'PRESENTE',
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-HISTORIAL-ABONADO-${fechaReservaAbonado}`
      },
      transaction
    });

    // 3. Reservas individuales (NO_ABONADO) en el pasado
    await Reserva.findOrCreate({
      where: {
        usuario_id: usuarioHistorial.id,
        turno_id: unTurno.id,
        fecha: fechaReservaIndividual
      },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'PRESENTE',
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-HISTORIAL-INDIVIDUAL-${fechaReservaIndividual}`
      },
      transaction
    });

    // Creamos su respectivo pago de seña para la reserva individual
    const reservaNoAbonado = await Reserva.findOne({
      where: { usuario_id: usuarioHistorial.id, fecha: fechaReservaIndividual },
      transaction
    });

    if (reservaNoAbonado) {
      await Pago.findOrCreate({
        where: {
          reserva_id: reservaNoAbonado.id,
          tipo_pago: 'SENA',
        },
        defaults: {
          usuario_id: usuarioHistorial.id,
          monto: 6000,
          estado: 'COMPLETADO',
          metodo_pago: 'MERCADO_PAGO'
        },
        transaction
      });
    }
  }
}

export async function seedTurnosMasivos(hashedPassword, transaction) {
  // --- NUEVO REQUERIMIENTO: Llenar masivamente los turnos nuevos de Voley y Futbol ---
  const turnoVoley = await Turno.findOne({ where: { hora_inicio: '18:00:00', dia_semana: 'JUEVES' }, include: [Actividad], transaction });
  const turnoFutbol = await Turno.findOne({ where: { hora_inicio: '20:00:00', dia_semana: 'LUNES' }, include: [Actividad], transaction });

  const turnosNuevos = [turnoVoley, turnoFutbol].filter(Boolean);

  for (const turno of turnosNuevos) {
    // 1. Crear usuarios ficticios equivalentes al cupo máximo para llenar el turno
    const dummyUsers = [];
    for (let i = 1; i <= turno.cupo_maximo; i++) {
      const [user] = await Usuario.findOrCreate({
        where: { email: `dummy${i}_${turno.id}@sportify.com` },
        defaults: {
          nombre: `Dummy${i}`,
          apellido: `Turno${turno.id}`,
          dni: `99000${turno.id}${i.toString().padStart(2, '0')}`,
          rol: 'CLIENTE',
          estado: 'HABILITADO',
          contrasena: hashedPassword
        },
        transaction
      });
      dummyUsers.push(user);
    }

    // 2. Buscar 3 fechas pasadas (últimos 30 días) que coincidan con su día de la semana
    const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const targetDay = DIAS_SEMANA.indexOf(turno.dia_semana.toUpperCase());
    const pastDates = [];
    const today = new Date();
    
    for (let i = 1; i <= 35; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === targetDay) {
        pastDates.push(d.toISOString().split('T')[0]);
        if (pastDates.length === 3) break; // Generamos 3 fechas
      }
    }

    // 3. Crear reservas para todos los dummy users en esas fechas
    for (const fecha of pastDates) {
      // Calcular mes_anio de esa fecha
      const refDate = new Date(`${fecha}T12:00:00Z`);
      const day = refDate.getDate();
      const jsMonth = refDate.getMonth();
      const mesAbono = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

      for (let i = 0; i < dummyUsers.length; i++) {
        const user = dummyUsers[i];
        const esAbonado = i % 2 === 0; // La mitad de los usuarios serán abonados, la otra puntuales

        if (esAbonado) {
          await AbonadoTurno.findOrCreate({
            where: {
              usuario_id: user.id,
              turno_id: turno.id,
              mes_anio: mesAbono
            },
            defaults: {
              fecha_alta: new Date(`${fecha}T12:00:00Z`),
              cancelaciones_mes: 0,
              pierde_descuento: false,
              estado: 'ACTIVO' 
            },
            transaction
          });

          await Reserva.findOrCreate({
            where: { usuario_id: user.id, turno_id: turno.id, fecha: fecha },
            defaults: {
              tipo_reserva: 'ABONADO',
              estado: 'PRESENTE',
              estado_pago: 'PAGADO_COMPLETO',
              codigo_qr: `QR-${turno.id}-${user.id}-${fecha}`
            },
            transaction
          });
        } else {
          const [reserva] = await Reserva.findOrCreate({
            where: { usuario_id: user.id, turno_id: turno.id, fecha: fecha },
            defaults: {
              tipo_reserva: 'NO_ABONADO',
              estado: 'PRESENTE',
              estado_pago: 'PAGADO_COMPLETO',
              codigo_qr: `QR-${turno.id}-${user.id}-${fecha}`
            },
            transaction
          });

          await Pago.findOrCreate({
            where: { reserva_id: reserva.id, tipo_pago: 'SENA' },
            defaults: {
              usuario_id: user.id,
              monto: (turno.Actividad?.precio_clase || 10000) * 0.5,
              estado: 'COMPLETADO',
              metodo_pago: 'MERCADO_PAGO'
            },
            transaction
          });
        }
      }
    }
  }
}
