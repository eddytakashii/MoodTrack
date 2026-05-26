import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { AuthService } from '../services/authService';

const router = Router();

export const adminMiddleware = async (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ erro: 'Token não fornecido' });
      return;
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      res.status(403).json({ erro: 'Acesso apenas para admin' });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Erro na autenticação' });
  }
};

router.post(
  '/',
  [
    body(['temperatura', 'temp']).optional().isFloat({ min: -50, max: 50 }),
    body(['luminosidade', 'luz']).optional().isFloat({ min: 0, max: 1000 }),
    body('ruido').optional().isFloat({ min: 0, max: 150 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ erros: errors.array() });
      return;
    }

    try {
      const temp = req.body.temp || req.body.temperatura;
      const luz = req.body.luz || req.body.luminosidade;
      const ruido = req.body.ruido;

      if (temp === undefined || luz === undefined || ruido === undefined) {
        res.status(400).json({
          erro: 'Campos obrigatórios: temp (ou temperatura), luz (ou luminosidade), ruido',
        });
        return;
      }

      const id = AuthService.generateId();
      const dataHora = req.body.horario || new Date().toISOString();

      await db.run(
        `INSERT INTO environment_data (id, temperatura, luminosidade, ruido, dataHora)
         VALUES (?, ?, ?, ?, ?)`,
        [id, temp, luz, ruido, dataHora]
      );

      // Gerar alertas baseado nos dados
      const alerts = await generateEnvironmentAlerts(temp, luz, ruido);

      res.status(201).json({
        id,
        temp,
        luz,
        ruido,
        dataHora,
        alerts: alerts,
      });
    } catch (error) {
      console.error('Erro ao salvar dados ambientais:', error);
      res.status(500).json({ erro: 'Erro ao salvar dados' });
    }
  }
);

const authMiddleware = async (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ erro: 'Token não fornecido' });
      return;
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({ erro: 'Token inválido' });
      return;
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Erro na autenticação' });
  }
};

router.get('/latest', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const ultimoDado = await db.get(
      `SELECT * FROM environment_data ORDER BY dataHora DESC LIMIT 1`
    );

    if (!ultimoDado) {
      res.status(404).json({ erro: 'Nenhum dado disponível' });
      return;
    }

    res.json(ultimoDado);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

router.get('/current', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ultimoDado = await db.get(
      `SELECT * FROM environment_data ORDER BY dataHora DESC LIMIT 1`
    );

    if (!ultimoDado) {
      res.status(404).json({ erro: 'Nenhum dado disponível' });
      return;
    }

    res.json(ultimoDado);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

async function generateEnvironmentAlerts(
  temperatura: number,
  luminosidade: number,
  ruido: number
): Promise<Array<{ tipo: string; mensagem: string }>> {
  try {
    const alertas: Array<{ tipo: string; mensagem: string }> = [];

    if (temperatura > 28) {
      alertas.push({
        tipo: 'TEMPERATURA',
        mensagem: 'Ambiente quente demais, pode causar desconforto.',
      });
    }

    if (luminosidade < 50) {
      alertas.push({
        tipo: 'ILUMINAÇÃO',
        mensagem: 'Iluminação fraca, risco de fadiga ocular.',
      });
    }

    if (ruido > 70) {
      alertas.push({
        tipo: 'RUÍDO',
        mensagem: 'Ambiente barulhento, foco prejudicado.',
      });
    }

    for (const alerta of alertas) {
      const id = AuthService.generateId();
      const dataHora = new Date().toISOString();

      await db.run(
        `INSERT INTO alerts (id, tipo, mensagem, dataHora, lido)
         VALUES (?, ?, ?, ?, ?)`,
        [id, alerta.tipo, alerta.mensagem, dataHora, 0]
      );
    }

    return alertas;
  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    return [];
  }
}

export default router;
