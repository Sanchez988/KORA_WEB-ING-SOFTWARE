import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
  tls: {
    rejectUnauthorized: false, // Aceptar certificados auto-firmados en desarrollo
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: '¡Bienvenido a Kora! Verifica tu correo',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo h1 { color: #FF6B9D; font-size: 36px; margin: 0; }
          .content { color: #2D3436; line-height: 1.6; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B9D 0%, #FFC947 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          .footer { text-align: center; color: #636E72; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Kora 💕</h1>
          </div>
          <div class="content">
            <h2>¡Bienvenido a Kora!</h2>
            <p>Hola,</p>
            <p>Gracias por registrarte en Kora, la plataforma de conexión universitaria de Pascual Bravo.</p>
            <p>Para completar tu registro y comenzar a conocer personas increíbles, por favor verifica tu correo electrónico:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi correo</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
            <p><strong>Este enlace expira en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
          </div>
          <div class="footer">
            <p>© 2026 Kora - Institución Universitaria Pascual Bravo</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Correo de verificación enviado a: ${email}`);
  } catch (error) {
    logger.error(`Error al enviar correo de verificación: ${error}`);
    // En desarrollo, no fallar el registro si el email no se puede enviar
    if (config.env !== 'production') {
      logger.warn(`⚠️ Modo desarrollo: Continuando sin enviar email de verificación`);
      logger.info(`🔗 URL de verificación (para pruebas): ${verificationUrl}`);
    } else {
      throw error;
    }
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Restablecer contraseña - Kora',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo h1 { color: #FF6B9D; font-size: 36px; margin: 0; }
          .content { color: #2D3436; line-height: 1.6; }
          .button { display: inline-block; background: linear-gradient(135deg, #FF6B9D 0%, #FFC947 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          .warning { background: #FFF3CD; border-left: 4px solid #FFC947; padding: 12px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #636E72; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>Kora 💕</h1>
          </div>
          <div class="content">
            <h2>Restablecer contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Kora.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 14px;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Este enlace expira en 1 hora.</strong>
            </div>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña actual permanecerá sin cambios.</p>
          </div>
          <div class="footer">
            <p>© 2026 Kora - Institución Universitaria Pascual Bravo</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Correo de restablecimiento enviado a: ${email}`);
  } catch (error) {
    logger.error(`Error al enviar correo de restablecimiento: ${error}`);
    // En desarrollo, no fallar si el email no se puede enviar
    if (config.env !== 'production') {
      logger.warn(`⚠️ Modo desarrollo: Continuando sin enviar email de restablecimiento`);
      logger.info(`🔗 URL de reset (para pruebas): ${resetUrl}`);
    } else {
      throw error;
    }
  }
};
