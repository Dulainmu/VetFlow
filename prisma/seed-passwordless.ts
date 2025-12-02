import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'unclaimed@example.com'

    // Clean up if exists
    await prisma.user.deleteMany({
        where: { email }
    })

    const clinic = await prisma.clinic.findFirst()
    if (!clinic) throw new Error("No clinic found")

    // Create passwordless user (simulating booking creation)
    await prisma.user.create({
        data: {
            email,
            firstName: 'Unclaimed',
            lastName: 'User',
            phone: '0000000000',
            role: 'PET_OWNER',
            clinicId: clinic.id,
            password: null // Explicitly null
        }
    })

    console.log(`Created passwordless user: ${email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
