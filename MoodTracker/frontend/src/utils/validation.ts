import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Schema para registro
export const registerSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

// Tipos inferidos dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Função helper para formatar erros do Zod
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path[0] as string;
    if (path) {
      formatted[path] = err.message;
    }
  });
  return formatted;
}

