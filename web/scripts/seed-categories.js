
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting category migration...')

    // Get all unique categories from MenuItem
    // Since we don't have distinct in raw query easily, we can use distinct option
    // Or just findMany and filter in JS if not too many
    const items = await prisma.menuItem.findMany({
        select: { category: true },
        where: { category: { not: '' } }
    })

    const uniqueCategories = [...new Set(items.map(i => i.category))]

    console.log(`Found ${uniqueCategories.length} unique categories:`, uniqueCategories)

    for (const catName of uniqueCategories) {
        if (!catName) continue

        // Check if exists
        const existing = await prisma.category.findUnique({
            where: { name: catName }
        })

        if (!existing) {
            await prisma.category.create({
                data: {
                    name: catName,
                    active: true,
                    displayOrder: 0
                }
            })
            console.log(`Created category: ${catName}`)
        } else {
            console.log(`Category exists: ${catName}`)
        }
    }

    console.log('Category migration completed.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
