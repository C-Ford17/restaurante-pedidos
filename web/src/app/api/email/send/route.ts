import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, to, data } = body

        if (!to) {
            return NextResponse.json(
                { error: 'Email recipient is required' },
                { status: 400 }
            )
        }

        let subject: string
        let html: string

        if (type === 'welcome') {
            // Welcome email for new registrations
            subject = `¡Bienvenido a Hamelin Foods! 🎉`
            html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">¡Bienvenido a Hamelin Foods!</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${data.adminName}</strong>,</p>
            
            <p>¡Gracias por registrarte en Hamelin Foods! Nos emociona tenerte a bordo.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">Detalles de tu cuenta:</h3>
                <p><strong>Restaurante:</strong> ${data.restaurantName}</p>
                <p><strong>Usuario:</strong> ${data.username}</p>
                <p><strong>Plan:</strong> ${data.plan}</p>
            </div>
            
            <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar nuestro sistema.</p>
            
            <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Iniciar Sesión</a>
            </center>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos en <a href="mailto:support@hamelinfoods.com">support@hamelinfoods.com</a></p>
            
            <p>¡Bienvenido a la familia Hamelin Foods!</p>
            
            <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Hamelin Foods</strong></p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Hamelin Foods. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `
        } else if (type === 'contact') {
            // Contact form email
            subject = `Nuevo mensaje de contacto - ${data.subject}`
            html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e293b; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin: 15px 0; }
        .label { font-weight: bold; color: #475569; }
        .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">Nuevo Mensaje de Contacto</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">De:</div>
                <div>${data.name}</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            
            <div class="field">
                <div class="label">Asunto:</div>
                <div>${data.subject}</div>
            </div>
            
            <div class="field">
                <div class="label">Mensaje:</div>
                <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
    </div>
</body>
</html>
            `
        } else {
            return NextResponse.json(
                { error: 'Invalid email type' },
                { status: 400 }
            )
        }

        // Send email using Resend
        const emailData = await resend.emails.send({
            from: 'Hamelin Foods <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
        })

        return NextResponse.json({ success: true, data: emailData })
    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json(
            { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
