import express from 'express';
import { InMemoryEnvioRepository } from './infraestructure/persistence/InMemoryEnvioRepository.js';
import { ActualizarEstadoEnvioUseCase } from './aplication/use-cases/ActualizarEstadoEnvioUseCase.js';
import { EnvioController } from './infraestructure/controllers/EnvioController.js';

const app = express();
app.use(express.json());

const envioRepository = new InMemoryEnvioRepository();
const actualizarEstadoUseCase = new ActualizarEstadoEnvioUseCase(envioRepository);
const envioController = new EnvioController(actualizarEstadoUseCase);

app.patch('/api/v1/envios/:id/estado', (req, res) => envioController.patchEstado(req, res));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de EnvioFacil corriendo en http://localhost:${PORT}`);
});