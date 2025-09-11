import nodemailer from "nodemailer"

export const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export const mailTemplate = (order: {
    id: string;
    name: string;
    email: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    status: string;
}) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Order Confirmation</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        margin: 0;
        padding: 0;
    }
    .container {
        background: #ffffff;
        max-width: 600px;
        margin: 20px auto;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #ddd;
    }
    .header {
        background-color: #4CAF50;
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 20px;
    }
    .content {
        padding: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
    }
    table th, table td {
        text-align: left;
        padding: 8px;
        border-bottom: 1px solid #ddd;
    }
    .total {
        font-weight: bold;
        font-size: 16px;
        text-align: right;
        padding-top: 10px;
    }
    .footer {
        background-color: #f1f1f1;
        text-align: center;
        font-size: 12px;
        padding: 10px;
        color: #777;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            Order #${order.id} - ${order.status}
        </div>
        <div class="content">
            <p>Hi ${order.name},</p>
            <p>Thank you for your purchase! Here are the details of your order:</p>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${(item.price / 100).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                Total: $${(order.total / 100).toFixed(2)}
            </div>
            <p>You can track your order status anytime by logging into your account.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </div>
    </div>
</body>
</html>
`
