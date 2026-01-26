const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'a_strong_secret_for_jwt';

module.exports = async function (req, res, next) {
  try {
    console.log("req.url",req.url)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // ✅ Fetch user from DB to get institution_id
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role_id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Try to get institution_id from staff or student registration
    const staff = await prisma.staffRegistration.findFirst({
      where: { user_id: user.id },
      select: { institution_id: true },
    });

    const student = !staff
      ? await prisma.studentRegistration.findFirst({
          where: { user_id: user.id },
          select: { institution_id: true },
        })
      : null;

    const institution_id = staff?.institution_id || student?.institution_id || null;

    // Attach user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role:decoded.role,
      institution_id,
    };

    next();

  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized or invalid token' });
  }
};
