# Vercel Deployment - Quick Start

## Opción 1: Configuración Automática (Más Fácil)

Ya creé el archivo `vercel.json` en la raíz del proyecto. Ahora solo:

1. **Sube el código a GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

2. **Importa en Vercel:**
   - Ve a https://vercel.com/new
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `restaurante-pedidos`
   - Vercel detectará automáticamente la configuración
   - Click "Deploy"

3. **Configura las variables de entorno:**
   - En el dashboard de Vercel, ve a Settings → Environment Variables
   - Agrega:
     ```
     DATABASE_URL=tu-url-postgres
     NEXTAUTH_SECRET=tu-secret
     NEXTAUTH_URL=https://tu-proyecto.vercel.app
     MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token
     NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
     ```

4. **Redeploy:**
   - Ve a Deployments
   - Click en los 3 puntos del último deployment
   - Click "Redeploy"

## Opción 2: CLI de Vercel

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy desde la raíz del proyecto
vercel

# Seguir las instrucciones
```

## Configurar Webhook en Mercado Pago

Una vez desplegado:

1. Copia tu URL de Vercel (ej: `https://restaurante-pedidos.vercel.app`)
2. Ve a https://www.mercadopago.com.co/developers/panel
3. Selecciona tu aplicación
4. Ve a Webhooks
5. Agrega: `https://tu-proyecto.vercel.app/api/webhooks/mercadopago`
6. Selecciona evento: `payment`
7. Guarda

## Verificar que funciona

1. Ve a `https://tu-proyecto.vercel.app/register`
2. Completa el registro
3. Paga con tarjeta de prueba: `5031 7557 3453 0604`, nombre `APRO`
4. Verifica en Vercel → Functions → `/api/webhooks/mercadopago` los logs
5. Verifica en tu BD que se creó la organización

¡Listo! 🚀
