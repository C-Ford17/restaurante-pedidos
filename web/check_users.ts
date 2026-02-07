
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: {
            organization: true
        }
    })
    console.log('Users found:', users.length)
    users.forEach(u => {
        if (u.username.includes('admin') || u.role.toLowerCase().includes('admin')) {
            console.log(`User: ${u.username}, Role: '${u.role}', OrgId: ${u.organizationId}, OrgSlug: ${u.organization?.slug}`)
        }
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
