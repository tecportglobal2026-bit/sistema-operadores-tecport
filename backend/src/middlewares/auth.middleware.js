const { supabaseAdmin } = require('../config/supabase');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Token de autenticación no proporcionado');
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    throw new ApiError(401, 'Token inválido o expirado');
  }

  const adminProfile = await prisma.adminProfile.findUnique({
    where: { authUserId: data.user.id },
  });

  if (!adminProfile) {
    throw new ApiError(403, 'No existe un perfil de administrador para este usuario');
  }

  if (!adminProfile.activo) {
    throw new ApiError(403, 'Tu usuario está inactivo. Contacta al administrador del sistema.');
  }

  req.authUser = data.user;
  req.adminProfile = adminProfile;
  next();
});

module.exports = { requireAuth };
