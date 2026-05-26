import { Router, Request, Response } from 'express';
import { db } from '../database';
import { adminMiddleware } from './environment';

const router = Router();

const authMiddleware = async (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ erro: 'Token não fornecido' });
      return;
    }

    const { AuthService } = await import('../services/authService');
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

router.get('/', authMiddleware, async (req: any, res: Response) => {
  try {
    let alertas;

    if (req.userRole === 'admin') {
      alertas = await db.all(
        `SELECT * FROM alerts ORDER BY dataHora DESC LIMIT 50`
      );
    } else {
      alertas = await db.all(
        `SELECT * FROM alerts WHERE userId IS NULL OR userId = ? ORDER BY dataHora DESC LIMIT 50`,
        [req.userId]
      );
    }

    res.json({
      total: alertas.length,
      alertas,
    });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ erro: 'Erro ao buscar alertas' });
  }
});

router.post('/', adminMiddleware, async (req: any, res: Response) => {
  try {
    const { tipo, mensagem, userId } = req.body;

    if (!tipo || !mensagem) {
      res.status(400).json({ erro: 'tipo e mensagem são obrigatórios' });
      return;
    }

    const { AuthService } = await import('../services/authService');
    const id = AuthService.generateId();
    const dataHora = new Date().toISOString();

    await db.run(
      `INSERT INTO alerts (id, tipo, mensagem, dataHora, userId, lido)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, tipo, mensagem, dataHora, userId || null, 0]
    );

    res.status(201).json({
      id,
      tipo,
      mensagem,
      dataHora,
      userId: userId || null,
      lido: false,
    });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    res.status(500).json({ erro: 'Erro ao criar alerta' });
  }
});

export default router;
