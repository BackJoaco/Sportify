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
    entrenador: 'Lionel Messi',
    dia_semana: 'LUNES',
    hora_inicio: '08:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Futbol',
    entrenador: 'Lionel Messi',
    dia_semana: 'MIERCOLES',
    hora_inicio: '08:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Tenis',
    entrenador: 'Guillermo Vilas',
    dia_semana: 'MARTES',
    hora_inicio: '09:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Tenis',
    entrenador: 'Guillermo Vilas',
    dia_semana: 'JUEVES',
    hora_inicio: '09:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Padel',
    entrenador: 'Agustín Tapia',
    dia_semana: 'LUNES',
    hora_inicio: '10:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Padel',
    entrenador: 'Agustín Tapia',
    dia_semana: 'MIERCOLES',
    hora_inicio: '10:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Voley',
    entrenador: 'Luciano De Cecco',
    dia_semana: 'MARTES',
    hora_inicio: '11:00:00',
    cupo_maximo: 2
  },
  {
    actividadNombre: 'Voley',
    entrenador: 'Luciano De Cecco',
    dia_semana: 'JUEVES',
    hora_inicio: '11:00:00',
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
