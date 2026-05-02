import nodemailer from 'nodemailer';

export interface EmailItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface OrderEmailData {
  id: string;
  customer_name: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount?: number;
  payment_method: string;
  items: EmailItem[];
  shipping_address: string;
  pincode: string;
}

export async function sendOrderConfirmationEmail(toEmail: string, orderData: OrderEmailData) {
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
       console.log("Mocking email send (No SMTP config found):", toEmail, orderData.id);
       return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const orderIdShort = orderData.id.toString().split('-')[0].toUpperCase();

    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 600; color: #1a1a1a;">${item.name}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">
            ${item.size ? `Size: ${item.size}` : ''} 
            ${item.size && item.color ? ' | ' : ''} 
            ${item.color ? `Color: ${item.color}` : ''}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #fafafa; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .header { background: #000000; color: #ffffff; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .order-meta { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; font-size: 12px; color: #999; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; }
          .total-row td { padding: 8px 0; }
          .grand-total { font-size: 18px; font-weight: 800; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 4px; text-transform: uppercase;">The DV27</h1>
            <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">Order Confirmed</p>
          </div>
          
          <div class="content">
            <h2 style="margin-top: 0;">Hi ${orderData.customer_name},</h2>
            <p>Your order has been received and is being prepared for shipment. Here are your order details:</p>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <table style="font-size: 14px;">
                <tr>
                  <td style="color: #666; padding-bottom: 4px;">Order ID</td>
                  <td style="color: #666; padding-bottom: 4px;">Payment</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">#${orderIdShort}</td>
                  <td style="font-weight: 700;">${orderData.payment_method}</td>
                </tr>
              </table>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: left; font-size: 12px; text-transform: uppercase; color: #999; padding-bottom: 10px;">Product</th>
                  <th style="text-align: center; font-size: 12px; text-transform: uppercase; color: #999; padding-bottom: 10px;">Qty</th>
                  <th style="text-align: right; font-size: 12px; text-transform: uppercase; color: #999; padding-bottom: 10px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 30px; margin-left: auto; width: 250px;">
              <table>
                <tr class="total-row">
                  <td style="color: #666;">Subtotal</td>
                  <td style="text-align: right;">₹${orderData.subtotal.toLocaleString()}</td>
                </tr>
                ${orderData.discount ? `
                <tr class="total-row">
                  <td style="color: #10b981;">Discount</td>
                  <td style="text-align: right; color: #10b981;">-₹${orderData.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td style="color: #666;">Shipping</td>
                  <td style="text-align: right;">${orderData.shipping_fee === 0 ? 'FREE' : `₹${orderData.shipping_fee}`}</td>
                </tr>
                <tr class="total-row grand-total">
                  <td style="font-weight: 800;">Total</td>
                  <td style="text-align: right; font-weight: 800; font-size: 20px;">₹${orderData.total_amount.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Shipping Address</h3>
              <p style="font-size: 14px; color: #666; margin: 0;">
                ${orderData.shipping_address}<br>
                Pincode: ${orderData.pincode}
              </p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
              <a href="https://thedv27.com/track?id=${orderData.id}" class="button">Track Your Order</a>
            </div>
          </div>

          <div class="footer">
            <p>If you have any questions, reply to this email or contact us on WhatsApp.</p>
            <p style="margin-top: 20px; font-weight: 600;">THE DV27</p>
            <p>Curated wardrobe essentials for the contemporary soul.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"The DV27" <noreply@thedv27.com>',
      to: toEmail,
      subject: `Order Confirmation - #${orderIdShort}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

