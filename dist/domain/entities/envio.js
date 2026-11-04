export class Envio {
    orden_id;
    estado_orden;
    direccion_entrega;
    cliente_id;
    pago_registrado;
    cancelacion;
    constructor(orden_id, estado_orden, direccion_entrega, cliente_id, pago_registrado = false, cancelacion) {
        this.orden_id = orden_id;
        this.estado_orden = estado_orden;
        this.direccion_entrega = direccion_entrega;
        this.cliente_id = cliente_id;
        this.pago_registrado = pago_registrado;
        this.cancelacion = cancelacion;
    }
    cancelar(usuario_id, motivo_cancelacion) {
        if (this.estado_orden === 'OUT_FOR_DELIVERY') {
            throw new Error("CONFLICT_SHIPPING_IN_ROUTE: No se puede cancelar: el envío ya está en ruta");
        }
        this.estado_orden = 'CANCELLED';
        this.cancelacion = { usuario_id, motivo_cancelacion, fecha_hora: new Date().toISOString() };
    }
}
