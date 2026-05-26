import * as turnoRepository from '../repositories/turno.repository.js';

export async function create(data) {
    return turnoRepository.create(data);
}

export async function getTurnos(){
    return turnoRepository.getTurnos();
}