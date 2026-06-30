export function calcularCuposDisponiblesFecha(turno, abonadosActivos, reservasFecha) {
  const abonadosActivosIds = new Set(
    abonadosActivos.map((abonado) => Number(abonado.usuario_id))
  );

  const abonadosConfirmadosIds = new Set();
  const abonadosCanceladosIds = new Set();
  let noAbonadosConfirmados = 0;

  reservasFecha.forEach((reserva) => {
    const usuarioId = Number(reserva.usuario_id);

    if (reserva.tipo_reserva === 'NO_ABONADO' && reserva.estado === 'CONFIRMADA') {
      noAbonadosConfirmados += 1;
      return;
    }

    if (reserva.tipo_reserva !== 'ABONADO' || !abonadosActivosIds.has(usuarioId)) {
      return;
    }

    if (reserva.estado === 'CONFIRMADA') {
      abonadosConfirmadosIds.add(usuarioId);
    }

    if (reserva.estado === 'CANCELADA') {
      abonadosCanceladosIds.add(usuarioId);
    }
  });

  const cancelacionesQueLiberanCupo = [...abonadosCanceladosIds].filter(
    (usuarioId) => !abonadosConfirmadosIds.has(usuarioId)
  ).length;

  const disponibles = turno.cupo_maximo
    - (abonadosActivos.length - cancelacionesQueLiberanCupo)
    - noAbonadosConfirmados;

  return Math.max(0, Math.min(turno.cupo_maximo, disponibles));
}
