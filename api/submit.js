// Vercel Serverless Function — AG AI Hub Contact Form
// Файл: api/submit.js (у корені репо, в папці api/)
// Відправляє email через Gmail при сабміті форми

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS — дозволяємо тільки з нашого домену
  res.setHeader('Access-Control-Allow-Origin', 'https://alfa-grissin-lpb.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Тільки POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, objectType, gpuCount, requirement } = req.body;

  // Валідація
  if (!name || !email) {
    return res.status(400).json({ error: 'Імʼя та email обовʼязкові' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Невалідний email' });
  }

  // Налаштування Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       // твій Gmail
      pass: process.env.GMAIL_APP_PASSWORD // App Password (не звичайний пароль!)
    }
  });

  // Лист для Alpha Grissin (повідомлення про новий запит)
  const adminMailOptions = {
    from: `"AG AI Hub Landing" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,           // куди приходить лід (можна замінити на office@alphagrissin.ua)
    replyTo: email,
    subject: `🔔 Новий запит AI Hub: ${name} — ${objectType || 'не вказано'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1A2B4A; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">
            Alpha Grissin · AI Hub — Новий запит
          </h2>
        </div>
        <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; width: 40%; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Імʼя</td>
              <td style="padding: 10px 0; color: #1A2B4A; font-weight: 600;">${name}</td>
            </tr>
            <tr style="border-top: 1px solid #e8e8e8;">
              <td style="padding: 10px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
              <td style="padding: 10px 0; color: #1A2B4A; font-weight: 600;">
                <a href="mailto:${email}" style="color: #E85B2D;">${email}</a>
              </td>
            </tr>
            <tr style="border-top: 1px solid #e8e8e8;">
              <td style="padding: 10px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Тип об'єкта</td>
              <td style="padding: 10px 0; color: #1A2B4A; font-weight: 600;">${objectType || '—'}</td>
            </tr>
            <tr style="border-top: 1px solid #e8e8e8;">
              <td style="padding: 10px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">GPU-стійок</td>
              <td style="padding: 10px 0; color: #1A2B4A; font-weight: 600;">${gpuCount || '—'}</td>
            </tr>
            <tr style="border-top: 1px solid #e8e8e8;">
              <td style="padding: 10px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Ключова вимога</td>
              <td style="padding: 10px 0; color: #1A2B4A; font-weight: 600;">${requirement || '—'}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 12px 16px; background: #E85B2D; border-radius: 6px; text-align: center;">
            <a href="mailto:${email}" style="color: #ffffff; font-weight: 700; text-decoration: none; font-size: 15px;">
              Відповісти → ${email}
            </a>
          </div>

          <p style="color: #999; font-size: 11px; margin-top: 16px; text-align: center;">
            Запит надійшов з alfa-grissin-lpb.vercel.app · ${new Date().toLocaleString('uk-UA', {timeZone: 'Europe/Kyiv'})}
          </p>
        </div>
      </div>
    `
  };

  // Лист клієнту (підтвердження)
  const clientMailOptions = {
    from: `"Alpha Grissin · AI Hub" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Ваш запит отримано — Alpha Grissin AI Hub`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1A2B4A; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Alpha Grissin · AI Hub</h2>
          <p style="color: #8fa8c8; margin: 8px 0 0 0; font-size: 14px;">Vertiv · HUBER+SUHNER · Cummins</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #1A2B4A; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
            ${name}, ваш запит отримано ✓
          </p>
          <p style="color: #555; line-height: 1.6; margin: 0 0 12px 0;">
            Наш інженер розгляне запит і напише вам протягом <strong>1 робочого дня</strong>.
          </p>
          <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">Деталі запиту:</p>
            <p style="color: #1A2B4A; margin: 4px 0; font-size: 14px;">📍 Тип об'єкта: <strong>${objectType || '—'}</strong></p>
            <p style="color: #1A2B4A; margin: 4px 0; font-size: 14px;">🖥️ GPU-стійок: <strong>${gpuCount || '—'}</strong></p>
            <p style="color: #1A2B4A; margin: 4px 0; font-size: 14px;">⚡ Ключова вимога: <strong>${requirement || '—'}</strong></p>
          </div>
          <p style="color: #555; font-size: 14px; margin: 0 0 8px 0;">Якщо питання термінові:</p>
          <p style="margin: 0;">
            <a href="tel:+380442517823" style="color: #E85B2D; font-weight: 600; text-decoration: none;">+38 044 251 78 23</a>
            &nbsp;·&nbsp;
            <a href="mailto:office@alphagrissin.ua" style="color: #E85B2D; font-weight: 600; text-decoration: none;">office@alphagrissin.ua</a>
          </p>
        </div>
        <p style="color: #bbb; font-size: 11px; text-align: center; margin-top: 12px;">
          Alpha Grissin Infotech Ukraine · Київ · 24×7 NOC
        </p>
      </div>
    `
  };

  try {
    // Відправляємо обидва листи паралельно
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(clientMailOptions)
    ]);

    return res.status(200).json({ success: true, message: 'Запит відправлено' });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Помилка відправки. Спробуйте ще раз.' });
  }
}
