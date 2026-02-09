import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Sincronizando límites de organizaciones existentes...')

    // 1. Plan Básico / Starter (antes 2, ahora 3)
    const basicUpdate = await prisma.organization.updateMany({
        where: {
            maxUsers: 2
        },
        data: {
            maxUsers: 3
        }
    })
    console.log(`✅ Plan Básico: ${basicUpdate.count} organizaciones actualizadas a 3 usuarios.`)

    // 2. Plan Profesional (antes 5, ahora 10)
    const proUpdate = await prisma.organization.updateMany({
        where: {
            maxUsers: 5
        },
        data: {
            maxUsers: 10
        }
    })
    console.log(`✅ Plan Profesional: ${proUpdate.count} organizaciones actualizadas a 10 usuarios.`)

    console.log('🎉 Sincronización completada.')
}

main()
    .catch((e) => {
        console.error('❌ Error en la sincronización:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
