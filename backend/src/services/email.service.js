import transporter from '../config/emailConfig.js';
 
export async function enviarEmailActivacion(email, token) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Activación de cuenta - Centro de Actividades',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Bienvenido al sistema</h2>
        <p>Tu cuenta como empleado fue creada exitosamente.</p>
        <p>Para establecer tu contraseña, hacé clic en el siguiente enlace:</p>
        <a 
          href="${process.env.BASE_URL}/set-password?token=${token}"
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Establecer contraseña
        </a>
        <p style="color: #666; font-size: 12px;">
          Este enlace expira en 24 horas. Si no esperabas este email, ignoralo.
        </p>
      </div>
    `
  });
}