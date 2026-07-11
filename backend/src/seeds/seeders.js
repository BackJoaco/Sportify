import { Actividad, Turno, Usuario, Reserva, Credito, Notificacion, AbonadoTurno, Pago, ListaEsperaAbonado, ListaEsperaNoAbonado } from '../models/index.model.js';
import { Op } from 'sequelize';

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
  console.log("seed usuarios con creditos apagado");
  // const usuarioConCreditos = await Usuario.findOne({
  //   where: { email: 'creditos@sportify.com' },
  //   transaction
  // });

  // const unTurno = await Turno.findOne({ transaction });

  // if (usuarioConCreditos && unTurno) {

  //   await AbonadoTurno.findOrCreate({
  //     where: {
  //       usuario_id: usuarioConCreditos.id,
  //       turno_id: unTurno.id,
  //       mes_anio: 7 // Suponiendo julio, ajustalo si es necesario
  //     },
  //     defaults: {
  //       fecha_alta: new Date(),
  //       cancelaciones_mes: 1, // Le sumamos 1 cancelación por la que generó el crédito
  //       pierde_descuento: false // Todavía no llegó a las 3 cancelaciones de la Regla 3
  //     },
  //     transaction
  //   });

  //   // 1. Creamos una reserva base (necesaria por la FK de la tabla creditos)
  //   const [reservaOrigen] = await Reserva.findOrCreate({
  //     where: {
  //       usuario_id: usuarioConCreditos.id,
  //       turno_id: unTurno.id,
  //       fecha: '2026-06-15'
  //     },
  //     defaults: {
  //       tipo_reserva: 'ABONADO',
  //       estado: 'CANCELADA',
  //       estado_pago: 'PAGADO_COMPLETO',
  //       codigo_qr: 'QR-SEED-PROBANDO-CREDITOS'
  //     },
  //     transaction
  //   });

  //   // Calcular fechas de vencimiento
  //   const fechaVencimientoFutura = new Date();
  //   fechaVencimientoFutura.setDate(fechaVencimientoFutura.getDate() + 15); // Vence en 15 días

  //   const fechaVencimientoPasada = new Date();
  //   fechaVencimientoPasada.setDate(fechaVencimientoPasada.getDate() - 5); // Venció hace 5 días

  //   // 2. Insertamos un crédito DISPONIBLE si no existe
  //   await Credito.findOrCreate({
  //     where: {
  //       usuario_id: usuarioConCreditos.id,
  //       estado: 'DISPONIBLE'
  //     },
  //     defaults: {
  //       fecha_vencimiento: fechaVencimientoFutura
  //     },
  //     transaction
  //   });

  //   // 3. Insertamos un crédito ya VENCIDO para probar filtros del historial
  //   await Credito.findOrCreate({
  //     where: {
  //       usuario_id: usuarioConCreditos.id,
  //       estado: 'VENCIDO'
  //     },
  //     defaults: {
  //       fecha_vencimiento: fechaVencimientoPasada
  //     },
  //     transaction
  //   });
  // }
}

export async function seedDeudores(transaction) {
  console.log("Seed deudores apagado");
  // // CASO 1: El deudor real (Debería aparecer en la lista)
  // const deudorPrueba = await Usuario.findOne({ where: { email: 'deudor@sportify.com' }, transaction });
  // if (deudorPrueba) {
  //   await Pago.findOrCreate({
  //     where: {
  //       usuario_id: deudorPrueba.id,
  //       tipo_pago: 'SENA',
  //       estado: 'PENDIENTE'
  //     },
  //     defaults: {
  //       monto: 12000,
  //       metodo_pago: null
  //     },
  //     transaction
  //   });
  // }

  // // CASO 2: El usuario al que le debemos plata (NO debería aparecer en la lista)
  // const acreedorPrueba = await Usuario.findOne({ where: { email: 'acreedor@sportify.com' }, transaction });
  // if (acreedorPrueba) {
  //   await Pago.findOrCreate({
  //     where: {
  //       usuario_id: acreedorPrueba.id,
  //       tipo_pago: 'DEVOLUCION_SENA',
  //       estado: 'PENDIENTE'
  //     },
  //     defaults: {
  //       monto: 15000,
  //       metodo_pago: null
  //     },
  //     transaction
  //   });
  // }
}

export async function seedHistorialPasado(transaction) {
  console.log("Seed historial pasado apagado");
  // // --- NUEVO REQUERIMIENTO: Usuario con historial en el pasado ---
  // const usuarioHistorial = await Usuario.findOne({ where: { email: 'historial@sportify.com' }, transaction });
  // const unTurno = await Turno.findOne({ transaction });

  // if (usuarioHistorial && unTurno) {

  //   // Buscar 2 fechas pasadas (últimos 30 días) que coincidan con el día de la semana del turno
  //   const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  //   const targetDay = DIAS_SEMANA.indexOf(unTurno.dia_semana.toUpperCase());
  //   const pastDates = [];
  //   const today = new Date();

  //   for (let i = 1; i <= 35; i++) { // buscamos hasta 35 días atrás para asegurar encontrar 2 fechas
  //     const d = new Date(today);
  //     d.setDate(d.getDate() - i);
  //     if (d.getDay() === targetDay) {
  //       pastDates.push(d.toISOString().split('T')[0]);
  //       if (pastDates.length === 2) break;
  //     }
  //   }

  //   const fechaReservaAbonado = pastDates[0] || '2026-06-20';
  //   const fechaReservaIndividual = pastDates[1] || '2026-06-10';

  //   // Calculamos a qué mes_anio pertenece la fechaReservaAbonado (según lógica Sportify)
  //   const refDate = new Date(`${fechaReservaAbonado}T12:00:00Z`);
  //   const day = refDate.getDate();
  //   const jsMonth = refDate.getMonth();
  //   const mesAbono = day < 11 ? (jsMonth === 0 ? 12 : jsMonth) : (jsMonth + 1);

  //   // 1. Abonado en un período anterior coincidente con la fecha
  //   await AbonadoTurno.findOrCreate({
  //     where: {
  //       usuario_id: usuarioHistorial.id,
  //       turno_id: unTurno.id,
  //       mes_anio: mesAbono
  //     },
  //     defaults: {
  //       fecha_alta: new Date(`${fechaReservaAbonado}T12:00:00Z`),
  //       cancelaciones_mes: 0,
  //       pierde_descuento: false,
  //       estado: 'ACTIVO'
  //     },
  //     transaction
  //   });

  //   // 2. Reservas de ese abono en el pasado
  //   await Reserva.findOrCreate({
  //     where: {
  //       usuario_id: usuarioHistorial.id,
  //       turno_id: unTurno.id,
  //       fecha: fechaReservaAbonado
  //     },
  //     defaults: {
  //       tipo_reserva: 'ABONADO',
  //       estado: 'PRESENTE',
  //       estado_pago: 'PAGADO_COMPLETO',
  //       codigo_qr: `QR-HISTORIAL-ABONADO-${fechaReservaAbonado}`
  //     },
  //     transaction
  //   });

  //   // 3. Reservas individuales (NO_ABONADO) en el pasado
  //   await Reserva.findOrCreate({
  //     where: {
  //       usuario_id: usuarioHistorial.id,
  //       turno_id: unTurno.id,
  //       fecha: fechaReservaIndividual
  //     },
  //     defaults: {
  //       tipo_reserva: 'NO_ABONADO',
  //       estado: 'PRESENTE',
  //       estado_pago: 'PAGADO_COMPLETO',
  //       codigo_qr: `QR-HISTORIAL-INDIVIDUAL-${fechaReservaIndividual}`
  //     },
  //     transaction
  //   });

  //   // Creamos su respectivo pago de seña para la reserva individual
  //   const reservaNoAbonado = await Reserva.findOne({
  //     where: { usuario_id: usuarioHistorial.id, fecha: fechaReservaIndividual },
  //     transaction
  //   });

  //   if (reservaNoAbonado) {
  //     await Pago.findOrCreate({
  //       where: {
  //         reserva_id: reservaNoAbonado.id,
  //         tipo_pago: 'SENA',
  //       },
  //       defaults: {
  //         usuario_id: usuarioHistorial.id,
  //         monto: 6000,
  //         estado: 'COMPLETADO',
  //         metodo_pago: 'MERCADO_PAGO'
  //       },
  //       transaction
  //     });
  //   }
  // }
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
// les genera reservas a clientes 2 y 3 para futbol de los miercoles en el dia 22 con sus correpondientes pagos 
// para demostrar con el cliente 1 que cuando hay una clase ocupada no se puede abonar
export async function seedReservasEspecificas(transaction) {
  // Buscar usuarios
  const cliente2 = await Usuario.findOne({ where: { email: 'cliente2@sportify.com' }, transaction });
  const cliente3 = await Usuario.findOne({ where: { email: 'cliente3@sportify.com' }, transaction });

  // Buscar turno Futbol Miercoles
  const turnoFutbolMiercoles = await Turno.findOne({
    where: { dia_semana: 'MIERCOLES' },
    include: [{
      model: Actividad,
      where: { nombre: 'Futbol' }
    }],
    transaction
  });

  const turnoFutbolDomingo = await Turno.findOne({
    where: { dia_semana: 'DOMINGO' },
    include: [{
      model: Actividad,
      where: { nombre: 'Futbol' }
    }],
    transaction
  });

  if (cliente2 && cliente3 && turnoFutbolMiercoles) {
    const fechaReserva = '2026-07-22';
    const monto = (turnoFutbolMiercoles.Actividad?.precio_clase || 12000) * 0.5;

    // Reserva Cliente 2
    const [reserva2] = await Reserva.findOrCreate({
      where: { usuario_id: cliente2.id, turno_id: turnoFutbolMiercoles.id, fecha: fechaReserva },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA',
        estado_pago: 'SENA_ABONADA',
        codigo_qr: `QR-SEED-${turnoFutbolMiercoles.id}-${cliente2.id}-${fechaReserva}`
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { reserva_id: reserva2.id, tipo_pago: 'SENA' },
      defaults: {
        usuario_id: cliente2.id,
        monto: monto,
        estado: 'COMPLETADO',
        metodo_pago: 'MERCADO_PAGO'
      },
      transaction
    });

    // Reserva Cliente 3
    const [reserva3] = await Reserva.findOrCreate({
      where: { usuario_id: cliente3.id, turno_id: turnoFutbolMiercoles.id, fecha: fechaReserva },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA',
        estado_pago: 'SENA_ABONADA',
        codigo_qr: `QR-SEED-${turnoFutbolMiercoles.id}-${cliente3.id}-${fechaReserva}`
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { reserva_id: reserva3.id, tipo_pago: 'SENA' },
      defaults: {
        usuario_id: cliente3.id,
        monto: monto,
        estado: 'COMPLETADO',
        metodo_pago: 'MERCADO_PAGO'
      },
      transaction
    });
  }

  if (cliente2 && cliente3 && turnoFutbolDomingo) {
    const fechaReserva = '2026-07-19';
    const monto = (turnoFutbolDomingo.Actividad?.precio_clase || 12000) * 0.5;

    // Reserva Cliente 2
    const [reserva2] = await Reserva.findOrCreate({
      where: { usuario_id: cliente2.id, turno_id: turnoFutbolDomingo.id, fecha: fechaReserva },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA',
        estado_pago: 'SENA_ABONADA',
        codigo_qr: `QR-SEED-${turnoFutbolDomingo.id}-${cliente2.id}-${fechaReserva}`
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { reserva_id: reserva2.id, tipo_pago: 'SENA' },
      defaults: {
        usuario_id: cliente2.id,
        monto: monto,
        estado: 'COMPLETADO',
        metodo_pago: 'MERCADO_PAGO'
      },
      transaction
    });

    // Reserva Cliente 3
    const [reserva3] = await Reserva.findOrCreate({
      where: { usuario_id: cliente3.id, turno_id: turnoFutbolDomingo.id, fecha: fechaReserva },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA',
        estado_pago: 'SENA_ABONADA',
        codigo_qr: `QR-SEED-${turnoFutbolDomingo.id}-${cliente3.id}-${fechaReserva}`
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { reserva_id: reserva3.id, tipo_pago: 'SENA' },
      defaults: {
        usuario_id: cliente3.id,
        monto: monto,
        estado: 'COMPLETADO',
        metodo_pago: 'MERCADO_PAGO'
      },
      transaction
    });
  }
}
// Abonado a cliente2 y a cliente3 a futbol de los viernes y le crea los pagos correspondientes
export async function seedAbonadosEspecificos(transaction) {
  const cliente2 = await Usuario.findOne({ where: { email: 'cliente2@sportify.com' }, transaction });
  const cliente3 = await Usuario.findOne({ where: { email: 'cliente3@sportify.com' }, transaction });

  const turnoFutbolViernes = await Turno.findOne({ 
    where: { dia_semana: 'VIERNES', hora_inicio: '08:00:00' }, 
    include: [{
      model: Actividad,
      where: { nombre: 'Futbol' }
    }],
    transaction 
  });

  if (cliente2 && cliente3 && turnoFutbolViernes) {
    const mesAnio = 7;
    const fechas = ['2026-07-03', '2026-07-10', '2026-07-17', '2026-07-24'];
    const montoAbono = turnoFutbolViernes.Actividad?.precio_mensual * 0.8;
    
    const clientes = [cliente2, cliente3];

    for (const cliente of clientes) {
      // 1. Crear el abono
      await AbonadoTurno.findOrCreate({
        where: {
          usuario_id: cliente.id,
          turno_id: turnoFutbolViernes.id,
          mes_anio: mesAnio
        },
        defaults: {
          fecha_alta: new Date('2026-07-11T10:00:00Z'),
          cancelaciones_mes: 0,
          pierde_descuento: false,
          estado: 'ACTIVO'
        },
        transaction
      });

      // 2. Crear el pago del abono
      await Pago.findOrCreate({
        where: { 
          usuario_id: cliente.id, 
          tipo_pago: 'SUSCRIPCION_MENSUAL',
          estado: 'COMPLETADO' // suponiendo que ya lo pagaron
        },
        defaults: {
          monto: montoAbono,
          metodo_pago: 'MERCADO_PAGO'
        },
        transaction
      });

      // 3. Crear las reservas (4 fechas)
      for (const fecha of fechas) {
        await Reserva.findOrCreate({
          where: { usuario_id: cliente.id, turno_id: turnoFutbolViernes.id, fecha },
          defaults: {
            tipo_reserva: 'ABONADO',
            estado: 'CONFIRMADA',
            estado_pago: 'PAGADO_COMPLETO',
            codigo_qr: `QR-SEED-ABONO-${turnoFutbolViernes.id}-${cliente.id}-${fecha}`
          },
          transaction
        });
      }
    }
  }
}

// Le crea al cliente1 un abono del mes 5, un abono del mes 6, y un abono del mes 7 suspendido, 
// ademas un credito vencido y otro usado
export async function seedCreditosCliente1(transaction) {
  const cliente1 = await Usuario.findOne({ where: { email: 'cliente1@sportify.com' }, transaction });
  
  const turnoTenis = await Turno.findOne({ 
    where: { dia_semana: 'MARTES', hora_inicio: '09:00:00' }, 
    include: [{ model: Actividad, where: { nombre: 'Tenis' } }],
    transaction 
  });
  
  const turnoPadel = await Turno.findOne({ 
    where: { dia_semana: 'MIERCOLES', hora_inicio: '10:00:00' }, // Padel is at 10:00 in data.js
    include: [{ model: Actividad, where: { nombre: 'Padel' } }],
    transaction 
  });

  if (cliente1 && turnoTenis && turnoPadel) {
    const montoTenis = turnoTenis.Actividad?.precio_mensual || 50000;
    const montoPadel = turnoPadel.Actividad?.precio_clase || 14000;

    // ==========================================
    // 1. Mes 5: Crédito Vencido
    // ==========================================
    await AbonadoTurno.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoTenis.id, mes_anio: 5 },
      defaults: {
        fecha_alta: new Date('2026-05-11T10:00:00Z'),
        cancelaciones_mes: 1,
        pierde_descuento: false,
        estado: 'ANTIGUO'
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { usuario_id: cliente1.id, tipo_pago: 'SUSCRIPCION_MENSUAL', estado: 'COMPLETADO', monto: montoTenis },
      defaults: { metodo_pago: 'MERCADO_PAGO', createdAt: new Date('2026-05-11T10:00:00Z') },
      transaction
    });

    // Reserva cancelada en Mes 5
    await Reserva.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoTenis.id, fecha: '2026-05-19' },
      defaults: {
        tipo_reserva: 'ABONADO',
        estado: 'CANCELADA',
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-SEED-CLI1-MES5-T${turnoTenis.id}`
      },
      transaction
    });

    // Crédito generado por la cancelación del Mes 5 (Vencido en Junio)
    await Credito.findOrCreate({
      where: { usuario_id: cliente1.id, estado: 'VENCIDO' },
      defaults: {
        fecha_vencimiento: new Date('2026-06-14T10:00:00Z'),
        createdAt: new Date('2026-05-15T10:00:00Z')
      },
      transaction
    });

    // ==========================================
    // 2. Mes 6: Crédito Usado
    // ==========================================
    await AbonadoTurno.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoTenis.id, mes_anio: 6 },
      defaults: {
        fecha_alta: new Date('2026-06-11T10:00:00Z'),
        cancelaciones_mes: 1,
        pierde_descuento: false,
        estado: 'ANTIGUO'
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { usuario_id: cliente1.id, tipo_pago: 'SUSCRIPCION_MENSUAL', estado: 'COMPLETADO', createdAt: new Date('2026-06-11T10:00:00Z') },
      defaults: { monto: montoTenis, metodo_pago: 'MERCADO_PAGO' },
      transaction
    });

    // Reserva cancelada en Mes 6
    await Reserva.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoTenis.id, fecha: '2026-06-23' },
      defaults: {
        tipo_reserva: 'ABONADO',
        estado: 'CANCELADA',
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-SEED-CLI1-MES6-T${turnoTenis.id}`
      },
      transaction
    });

    // Crédito generado por la cancelación del Mes 6 (Usado en Julio)
    await Credito.findOrCreate({
      where: { usuario_id: cliente1.id, estado: 'USADO' },
      defaults: {
        fecha_vencimiento: new Date('2026-07-20T10:00:00Z'),
        createdAt: new Date('2026-06-20T10:00:00Z')
      },
      transaction
    });

    // ==========================================
    // 3. Mes 7: Uso del Crédito
    // ==========================================
    // Reserva individual pagada con el crédito
    const [reservaUsoCredito] = await Reserva.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoPadel.id, fecha: '2026-07-08' },
      defaults: {
        tipo_reserva: 'NO_ABONADO',
        estado: 'CONFIRMADA', // Ya pasó, podría ser PRESENTE pero está bien CONFIRMADA
        estado_pago: 'PAGADO_COMPLETO',
        codigo_qr: `QR-SEED-CLI1-MES7-PADEL`
      },
      transaction
    });

    // Pago con Crédito
    await Pago.findOrCreate({
      where: { reserva_id: reservaUsoCredito.id, tipo_pago: 'CLASE_COMPLETA' },
      defaults: {
        usuario_id: cliente1.id,
        monto: montoPadel,
        estado: 'COMPLETADO',
        metodo_pago: 'CREDITO',
        createdAt: new Date('2026-07-05T10:00:00Z')
      },
      transaction
    });

    // ==========================================
    // 4. Mes 7: Abono Suspendido y Pago Pendiente
    // ==========================================
    const [abonoSuspendido] = await AbonadoTurno.findOrCreate({
      where: { usuario_id: cliente1.id, turno_id: turnoTenis.id, mes_anio: 7 },
      defaults: {
        fecha_alta: new Date('2026-07-11T10:00:00Z'),
        cancelaciones_mes: 0,
        pierde_descuento: true,
        estado: 'SUSPENDIDO'
      },
      transaction
    });

    await Pago.findOrCreate({
      where: { usuario_id: cliente1.id, tipo_pago: 'SUSCRIPCION_MENSUAL', estado: 'PENDIENTE', abonado_turno_id: abonoSuspendido.id },
      defaults: {
        monto: montoTenis,
        metodo_pago: 'MERCADO_PAGO',
        createdAt: new Date('2026-07-01T10:00:00Z')
      },
      transaction
    });
  }
}


export async function seedColaAbonadosFutbol(transaction) {
  const turnoFutbolViernes = await Turno.findOne({
    where: { dia_semana: 'VIERNES', hora_inicio: '08:00:00' },
    include: [{ model: Actividad, where: { nombre: 'Futbol' } }],
    transaction
  });

  if (!turnoFutbolViernes) return;

  const dummies = await Usuario.findAll({
    where: {
      email: {
        [Op.like]: 'dummy%@sportify.com'
      }
    },
    limit: 9,
    transaction
  });

  for (let i = 0; i < dummies.length; i++) {
    await ListaEsperaAbonado.findOrCreate({
      where: { usuario_id: dummies[i].id, turno_id: turnoFutbolViernes.id },
      defaults: {
        estado: 'EN_ESPERA',
        posicion: i + 1
      },
      transaction
    });
  }

  // --- Adición: cliente4 en lista espera no abonado Fútbol Domingo ---
  const cliente4 = await Usuario.findOne({ where: { email: 'cliente4@sportify.com' }, transaction });
  const turnoFutbolDomingo = await Turno.findOne({
    where: { dia_semana: 'DOMINGO', hora_inicio: '08:00:00' }, // asumiendo 08:00:00 por los otros turnos, vamos a asegurarnos que es el correcto si no se puede usar include model Actividad
    include: [{ model: Actividad, where: { nombre: 'Futbol' } }],
    transaction
  });

  if (cliente4 && turnoFutbolDomingo) {
    await ListaEsperaNoAbonado.findOrCreate({
      where: {
        usuario_id: cliente4.id,
        turno_id: turnoFutbolDomingo.id,
        fecha: '2026-07-19'
      },
      defaults: {
        estado: 'EN_ESPERA',
        posicion: 1
      },
      transaction
    });
  }
}
