import { Pago } from '../models/index.model.js';

export async function create(data) {
    return Pago.create(data);
}
