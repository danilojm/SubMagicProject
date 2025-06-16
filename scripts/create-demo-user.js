const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Dados do usuário demo
    const email = 'demo@subtitlepro.com';
    const password = 'demo123';
    const saltRounds = 10;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('Usuário demo já existe!');
      return;
    }
    
    // Cria o usuário demo
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    });
    
    console.log('Usuário demo criado com sucesso!');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Senha:', password);
    
  } catch (error) {
    console.error('Erro ao criar usuário demo:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o script
createDemoUser()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha no script:', error);
    process.exit(1);
  });