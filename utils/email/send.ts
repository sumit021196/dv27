import nodemailer from 'nodemailer';

export async function sendOrderConfirmationEmail(toEmail: string, orderDetails: any) {
  try {
    // Note: For a real application, you should configure this with actual SMTP credentials.
    // For now, we will create a mock transport or just log if env vars aren't available.

    // In a real app you'd get this from environment
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
       console.log("Mocking email send (No SMTP config found):", toEmail, orderDetails.id);
       return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"The DV27" <noreply@thedv27.com>',
      to: toEmail,
      subject: `Order Confirmation - #${orderDetails.id.split('-')[0]}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order has been confirmed.</p>
        <p><strong>Order ID:</strong> ${orderDetails.id.split('-')[0]}</p>
        <p><strong>Total Amount:</strong> ₹${orderDetails.total_amount}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.payment_method}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
