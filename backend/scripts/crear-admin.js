require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const prisma = require('../src/config/prisma');

async function main() {
  const [, , correo, password, ...restoNombre] = process.argv;
  const nombre = restoNombre.join(' ');

  if (!correo || !password || !nombre) {
    console.error('Uso: node scripts/crear-admin.js <correo> <password> <nombre completo>');
    process.exit(1);
  }

  const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creando el usuario en Supabase Auth:', error.message);
    process.exit(1);
  }

  const adminProfile = await prisma.adminProfile.create({
    data: {
      authUserId: data.user.id,
      nombre,
      rol: 'admin',
      activo: true,
    },
  });

  console.log('Administrador creado correctamente:');
  console.log({ authUserId: data.user.id, email: correo, adminProfile });
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
