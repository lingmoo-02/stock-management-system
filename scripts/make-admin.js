const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // すべてのユーザーを取得
  const users = await prisma.profile.findMany()

  console.log('登録されているユーザー:')
  users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}, 名前: ${user.name}, メール: ${user.email}, ロール: ${user.role}`)
  })

  if (users.length === 0) {
    console.log('ユーザーが見つかりません')
    return
  }

  // 最初のユーザーを管理者に昇格
  const firstUser = users[0]
  const updated = await prisma.profile.update({
    where: { id: firstUser.id },
    data: { role: 'ADMIN' },
  })

  console.log(`\n✅ ${updated.name} (${updated.email}) を管理者に昇格させました`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
