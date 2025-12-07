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
    // ALWAYS Log to console for Demo/Debugging purposes
    console.log('---------------------------------------------------------');
    console.log(`🔐 Verification for: ${email}`);
    console.log(`🔗 Link: ${verificationLink}`);
    console.log('---------------------------------------------------------');

    // 1. Try Resend API first
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: 'Shopify Analytics <onboarding@resend.dev>',
                to: email,
                subject: 'Verify your email',
                html: emailHtml,
            });

            if (error) {
                console.error("Resend API error:", error); // Log and continue to SMTP
            } else {
                console.log("Email sent via Resend:", data?.id);
                return; // Success!
            }
        } catch (error) {
            console.error("Resend API failed:", error);
        }
    }

    // 2. Fallback: SMTP (Gmail/Other) - Allows sending to ANY email
    if (process.env.SMTP_HOST) {
        try {
            console.log("Attempting fallback to SMTP...");
            const port = Number(process.env.SMTP_PORT) || 587;
            const secureEnv = process.env.SMTP_SECURE;
            const secure = secureEnv !== undefined ? secureEnv === 'true' : port === 465;

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port,
                secure,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Shopify Analytics" <no-reply@shopify-analytics.com>',
                to: email,
                subject: "Verify your email",
                text: `Please verify your email: ${verificationLink}`,
                html: emailHtml,
            });

            console.log("Message sent via SMTP: %s", info.messageId);
            return;
        } catch (error) {
            console.error("SMTP failed:", error);
        }
    } else {
        console.warn("⚠️  No email provider worked. Use the link logged above.");
    }
};
