export const DEFAULT_PASSWORD = 'Asdasd1.';

export const usuariosSeed = [
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
  },
  {
    nombre: 'Deudor',
    apellido: 'Prueba',
    dni: '10000008',
    email: 'deudor@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Acreedor',
    apellido: 'Prueba',
    dni: '10000009',
    email: 'acreedor@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  },
  {
    nombre: 'Historial',
    apellido: 'Pasado',
    dni: '10000010',
    email: 'historial@sportify.com',
    rol: 'CLIENTE',
    estado: 'HABILITADO'
  }
];

export const actividadesSeed = [
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

export const turnosSeed = [
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
  },
  {
    actividadNombre: 'Voley',
    entrenador: 'Juani',
    dia_semana: 'JUEVES',
    hora_inicio: '18:00:00',
    cupo_maximo: 6
  },
  {
    actividadNombre: 'Futbol',
    entrenador: 'Pepe',
    dia_semana: 'LUNES',
    hora_inicio: '20:00:00',
    cupo_maximo: 10
  }
];
