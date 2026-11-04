export type EstadoEnvio = 'RECEIVED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export class Envio {
  constructor(
    public readonly orden_id: string,
    public estado_orden: EstadoEnvio,
    public direccion_entrega: string,
    public cliente_id: number,
    public pago_registrado: boolean = false,
    public cancelacion?: { usuario_id: number; motivo_cancelacion: string; fecha_hora: string }
  ) {}

  public cancelar(usuario_id: number, motivo_cancelacion: string): void {
    if (this.estado_orden === 'OUT_FOR_DELIVERY') {
      throw new Error("CONFLICT_SHIPPING_IN_ROUTE: No se puede cancelar: el envío ya está en ruta");
    }
    this.estado_orden = 'CANCELLED';
    this.cancelacion = { usuario_id, motivo_cancelacion, fecha_hora: new Date().toISOString() };
  }
}
