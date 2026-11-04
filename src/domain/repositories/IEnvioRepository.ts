import { Envio } from '../entities/envio.js';

export interface IEnvioRepository {
  findById(orden_id: string): Promise<Envio | null>;
  save(envio: Envio): Promise<void>;
}