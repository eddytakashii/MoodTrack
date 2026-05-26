import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database';
import { AuthService } from '../services/authService';

const router = Router();

// Middleware para validar entrada
const validateInput = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Retornar apenas a primeira mensagem de erro de forma clara
    const firstError = errors.array()[0] as any;
    const mensagem = firstError.msg || 'Dados inválidos';
    res.status(400).json({ erro: mensagem });
    return;
  }
  next();
};

// POST /auth/register
router.post(
  '/register',
  [
    body('nome')
      .isString().withMessage('Nome deve ser texto')
      .trim()
      .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    body('email')
      .isEmail().withMessage('Email inválido'),
    body('senha')
      .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  validateInput,
  async (req: Request, res: Response) => {
    try {
      const { nome, email, senha } = req.body;
      
      // Normalizar email (trim e lowercase)
      const emailNormalizado = email?.trim().toLowerCase();

      // Verificar se usuário já existe
      const usuarioExistente = await db.get('SELECT id FROM users WHERE email = ?', [emailNormalizado]);
      if (usuarioExistente) {
        res.status(400).json({ erro: 'Email já registrado' });
        return;
      }

      const id = AuthService.generateId();
      const senhaHash = await AuthService.hashPassword(senha);
      const agora = new Date().toISOString();

      await db.run(
        `INSERT INTO users (id, nome, email, senhaHash, role, criadoEm, atualizadoEm)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, nome, emailNormalizado, senhaHash, 'user', agora, agora]
      );

      const token = AuthService.generateToken(id, 'user');

      res.status(201).json({
        token,
        usuario: {
          id,
          nome,
          email,
          role: 'user',
          criadoEm: agora,
          atualizadoEm: agora,
        },
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ erro: 'Erro ao registrar usuário' });
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Email inválido'),
    body('senha')
      .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  ],
  validateInput,
  async (req: Request, res: Response) => {
    try {
      const { email, senha } = req.body;
      
      // Normalizar email (trim e lowercase)
      const emailNormalizado = email?.trim().toLowerCase();

      const usuario = await db.get('SELECT * FROM users WHERE email = ?', [emailNormalizado]);

      if (!usuario) {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
        return;
      }

      const senhaValida = await AuthService.comparePassword(senha, usuario.senhaHash);

      if (!senhaValida) {
        res.status(401).json({ erro: 'Email ou senha inválidos' });
        return;
      }

      const token = AuthService.generateToken(usuario.id, usuario.role);

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          criadoEm: usuario.criadoEm,
          atualizadoEm: usuario.atualizadoEm,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro ao fazer login' });
    }
  }
);

// Middleware de autenticação para rotas protegidas
const authMiddleware = (req: any, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ erro: 'Token não fornecido' });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// GET /auth/me - Buscar dados do usuário autenticado
router.get('/me', authMiddleware, async (req: any, res: Response) => {
  try {
    const usuario = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);

    if (!usuario) {
      res.status(404).json({ erro: 'Usuário não encontrado' });
      return;
    }

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        criadoEm: usuario.criadoEm,
        atualizadoEm: usuario.atualizadoEm,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
  }
});

// DELETE /auth/delete-account - Deletar conta do usuário
router.delete('/delete-account', authMiddleware, async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    // Deletar todas as entradas de humor do usuário
    await db.run('DELETE FROM mood_entries WHERE userId = ?', [userId]);

    // Deletar todos os dados ambientais do usuário
    await db.run('DELETE FROM environment_data WHERE userId = ?', [userId]);

    // Deletar todos os alertas do usuário
    await db.run('DELETE FROM alerts WHERE userId = ?', [userId]);

    // Deletar o usuário
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ mensagem: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ erro: 'Erro ao deletar conta' });
  }
});

export default router;
