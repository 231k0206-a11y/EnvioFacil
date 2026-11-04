import type { IEnvioRepository } from '../../domain/repositories/IEnvioRepository.js';
import { Envio } from '../../domain/entities/envio.js';

export class InMemoryEnvioRepository implements IEnvioRepository {
  private envios: Map<string, Envio> = new Map();

  constructor() {
    this.envios.set('EF-3001', new Envio('EF-3001', 'PREPARING', 'Calle Principal 123', 101, true));
    this.envios.set('EF-3002', new Envio('EF-3002', 'OUT_FOR_DELIVERY', 'Av. Central 456', 102, true));
  }

  async findById(orden_id: string): Promise<Envio | null> {
    return this.envios.get(orden_id) || null;
  }

  async save(envio: Envio): Promise<void> {
    this.envios.set(envio.orden_id, envio);
  }
}