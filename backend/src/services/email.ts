import nodemailer from 'nodemailer';

// Create a transporter using Ethereal email for testing
// In production, user should provide real SMTP credentials
const createTransporter = async () => {
    // If we have real credentials, use them
    if (process.env.SMTP_HOST) {
        const port = Number(process.env.SMTP_PORT) || 587;
        const secureEnv = process.env.SMTP_SECURE;

        // Auto-detect secure based on port if not explicitly set
        // Port 465 is implicit SSL (secure: true)
        // Port 587 is STARTTLS (secure: false)
        const secure = secureEnv !== undefined
            ? secureEnv === 'true'
            : port === 465;

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Otherwise generate test account
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const transporter = await createTransporter();

    // Construct the verification link
    // Assuming frontend is running on default Vite port 8080 or configurable
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
        from: '"Shopify Analytics" <no-reply@shopify-analytics.com>',
        to: email,
        subject: "Verify your email",
        text: `Please verify your email by clicking the following link: ${verificationLink}`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Shopify Analytics!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy and paste this link: ${verificationLink}</p>
      </div>
    `,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when using Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
