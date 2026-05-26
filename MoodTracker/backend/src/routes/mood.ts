import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { AuthService } from '../services/authService';

const router = Router();

export const authMiddleware = async (req: any, res: Response, next: Function) => {
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

router.post(
  '/',
  authMiddleware,
  [
    body('humor').isIn(['feliz', 'neutro', 'ansioso', 'cansado']),
    body('comentario').optional().isString().trim(),
  ],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ erros: errors.array() });
      return;
    }

    try {
      const { humor, comentario } = req.body;
      const userId = req.userId;

      const id = AuthService.generateId();
      const dataHora = new Date().toISOString();

      await db.run(
        `INSERT INTO mood_entries (id, userId, humor, comentario, dataHora)
         VALUES (?, ?, ?, ?, ?)`,
        [id, userId, humor, comentario || null, dataHora]
      );

      res.status(201).json({
        id,
        userId,
        humor,
        comentario,
        dataHora,
      });
    } catch (error) {
      console.error('Erro ao salvar humor:', error);
      res.status(500).json({ erro: 'Erro ao salvar humor' });
    }
  }
);

router.get('/user/:userId', authMiddleware, async (req: any, res: Response) => {
  try {
    if (req.userId !== req.params.userId && req.userRole !== 'admin') {
      res.status(403).json({ erro: 'Acesso negado' });
      return;
    }

    const registros = await db.all(
      `SELECT * FROM mood_entries WHERE userId = ? ORDER BY dataHora DESC`,
      [req.params.userId]
    );

    const mediaSemanal = await db.get(
      `SELECT AVG(CASE 
        WHEN humor = 'feliz' THEN 4
        WHEN humor = 'neutro' THEN 2
        WHEN humor = 'ansioso' THEN 1
        WHEN humor = 'cansado' THEN 1
      END) as media
       FROM mood_entries 
       WHERE userId = ? AND dataHora > datetime('now', '-7 days')`,
      [req.params.userId]
    );

    res.json({
      totalEntries: registros.length,
      mediaSemanal: mediaSemanal?.media || 0,
      ultimoRegistro: registros[0] || null,
      registros,
    });
  } catch (error) {
    console.error('Erro ao buscar humor:', error);
    res.status(500).json({ erro: 'Erro ao buscar registros' });
  }
});

// IMPORTANTE: Esta rota deve vir DEPOIS de rotas mais específicas como /user/:userId
router.delete('/:id', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    

    const registro = await db.get(
      'SELECT * FROM mood_entries WHERE id = ?',
      [id]
    );

    if (!registro) {
      res.status(404).json({ erro: 'Registro não encontrado' });
      return;
    }

    if (registro.userId !== userId && req.userRole !== 'admin') {
      res.status(403).json({ erro: 'Acesso negado' });
      return;
    }

    await db.run('DELETE FROM mood_entries WHERE id = ?', [id]);

    res.json({ mensagem: 'Registro deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ erro: 'Erro ao deletar registro' });
  }
});

export default router;
