import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

export const sendVerificationEmail = async (email: string, token: string) => {
    // Construct the verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Shopify Analytics!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy and paste this link: ${verificationLink}</p>
      </div>
    `;

    // 1. Priority: Use Resend API (Best for Production, Bypasses Port blocks)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: 'Shopify Analytics <onboarding@resend.dev>', // Default testing domain
                to: email,
                subject: 'Verify your email',
                html: emailHtml,
            });

            if (error) {
                console.error("Resend API returned error:", error);
                throw error;
            }

            console.log("Email sent via Resend:", data?.id);
            return;
        } catch (error) {
            console.error("Resend API failed, falling back to SMTP:", error);
        }
    }

    // 2. Fallback: SMTP (Nodemailer)
    // Create a transporter using Ethereal email for testing or provided SMTP
    let transporter;

    if (process.env.SMTP_HOST) {
        const port = Number(process.env.SMTP_PORT) || 587;
        const secureEnv = process.env.SMTP_SECURE;
        const secure = secureEnv !== undefined ? secureEnv === 'true' : port === 465;

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });
    } else {
        // Otherwise generate test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const info = await transporter.sendMail({
        from: '"Shopify Analytics" <no-reply@shopify-analytics.com>',
        to: email,
        subject: "Verify your email",
        text: `Please verify your email: ${verificationLink}`,
        html: emailHtml,
    });

    console.log("Message sent via SMTP: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};
