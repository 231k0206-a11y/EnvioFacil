import type { IEnvioRepository } from '../../domain/repositories/IEnvioRepository.js';
import type { EstadoEnvio } from '../../domain/entities/envio.js';

export class ActualizarEstadoEnvioUseCase {
  constructor(private readonly envioRepository: IEnvioRepository) {}

  async execute(dto: { orden_id: string; nuevo_estado: EstadoEnvio; usuario_id?: number; motivo_cancelacion?: string }) {
  const envio = await this.envioRepository.findById(dto.orden_id);
  if (!envio) {
    throw new Error("NOT_FOUND: Orden no encontrada");
  }

  if (dto.nuevo_estado === 'CANCELLED') {
    // Validación de conflicto si ya está en ruta
    if (envio.estado_orden === 'OUT_FOR_DELIVERY') {
      throw new Error("CONFLICT: No se puede cancelar: el envío ya está en ruta");
    }

    if (!dto.usuario_id || !dto.motivo_cancelacion) {
      throw new Error("BAD_REQUEST: usuario_id y motivo_cancelacion son obligatorios para cancelar");
    }
    envio.cancelar(dto.usuario_id, dto.motivo_cancelacion);
  } else {
    envio.estado_orden = dto.nuevo_estado;
  }

  await this.envioRepository.save(envio);
  return envio;
}
}