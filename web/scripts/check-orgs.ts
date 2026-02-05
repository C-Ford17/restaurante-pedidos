import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Verificando organizaciones existentes...\n')

    try {
        const allOrgs = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        console.log(`📊 Total de organizaciones: ${allOrgs.length}\n`)

        if (allOrgs.length === 0) {
            console.log('ℹ️  No hay organizaciones en la base de datos')
            return
        }

        console.log('Organizaciones encontradas:')
        console.log('─'.repeat(80))

        allOrgs.forEach((org, index) => {
            console.log(`${index + 1}. ${org.name}`)
            console.log(`   ID: ${org.id}`)
            console.log(`   Slug: ${org.slug || '❌ SIN SLUG'}`)
            console.log(`   Creado: ${org.createdAt.toLocaleDateString()}`)
            console.log()
        })

        const withoutSlug = allOrgs.filter(org => !org.slug || org.slug === '')

        if (withoutSlug.length > 0) {
            console.log(`\n⚠️  ${withoutSlug.length} organizaciones necesitan slug asignado`)
            console.log('\nPara asignar slugs automáticamente, ejecuta:')
            console.log('  npm run migrate:slugs')
        } else {
            console.log('\n✅ Todas las organizaciones tienen slug asignado')
        }

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('Error fatal:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
