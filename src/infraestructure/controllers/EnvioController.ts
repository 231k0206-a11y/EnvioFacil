import type { Request, Response } from 'express';
import { ActualizarEstadoEnvioUseCase } from '../../aplication/use-cases/ActualizarEstadoEnvioUseCase.js';

export class EnvioController {
  constructor(private readonly actualizarEstadoUseCase: ActualizarEstadoEnvioUseCase) {}

  async patchEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nuevo_estado, usuario_id, motivo_cancelacion } = req.body;
      
      const resultado = await this.actualizarEstadoUseCase.execute({ 
        orden_id: String(id), 
        nuevo_estado, 
        usuario_id, 
        motivo_cancelacion 
      });

      return res.status(200).json({ mensaje: "Estado actualizado con éxito", orden_id: resultado.orden_id });
    } catch (error: any) {
      if (error.message.startsWith("CONFLICT")) {
        return res.status(409).json({ codigoError: "CONFLICT_SHIPPING_IN_ROUTE", mensaje: error.message.split(": ")[1] });
      } else if (error.message.startsWith("BAD_REQUEST")) {
        return res.status(400).json({ codigoError: "BAD_REQUEST", mensaje: error.message.split(": ")[1] });
      } else if (error.message.startsWith("NOT_FOUND")) {
        return res.status(404).json({ codigoError: "NOT_FOUND", mensaje: error.message.split(": ")[1] });
      } else {
        return res.status(500).json({ codigoError: "INTERNAL_SERVER_ERROR", mensaje: error.message });
      }
    }
  }
}