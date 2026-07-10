import nodemailer from 'nodemailer';

let transporter;

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function isMailConfigured() {
    return Boolean(
        process.env.MAIL_HOST &&
        process.env.MAIL_PORT &&
        process.env.MAIL_USER &&
        process.env.MAIL_PASSWORD
    );
}

function getTransporter() {
    if (!isMailConfigured()) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    return transporter;
}

export async function sendMail({ to, subject, text, html }) {
    const mailTransporter = getTransporter();

    if (!mailTransporter) {
        console.warn('Mail no configurado. Se omitio el envio.');
        return null;
    }


    const info = await mailTransporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        text,
        html
    });

    console.log('Email enviado:', info.messageId);

    return info;
}

export function sendWelcomeEmail(usuario) {
    const nombre = escapeHtml(usuario.nombre);

    return sendMail({
        to: usuario.email,
        subject: 'Bienvenido a Sportify',
        text: `Hola ${usuario.nombre},

Tu cuenta en Sportify ha sido creada con exito.

A partir de ahora podes ingresar a la plataforma para consultar actividades, reservar turnos y gestionar tu perfil.

Gracias por sumarte.

Equipo Sportify`,
        html: `
            <p>Hola ${nombre},</p>
            <p>Tu cuenta en <strong>Sportify</strong> ha sido creada con exito.</p>
            <p>A partir de ahora podes ingresar a la plataforma para consultar actividades, reservar turnos y gestionar tu perfil.</p>
            <p>Gracias por sumarte.</p>
            <p>Equipo Sportify</p>
        `
    });
}
