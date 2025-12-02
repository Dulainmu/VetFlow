import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'unclaimed@example.com'

    const user = await prisma.user.findUnique({
        where: { email }
    })

    console.log('User found:', !!user)
    if (user) {
        console.log('Has password:', !!user.password)
        console.log('Role:', user.role)
        console.log('First Name:', user.firstName)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
