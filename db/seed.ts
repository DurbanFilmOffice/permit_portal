import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
import { hash } from 'bcryptjs'
import { users } from './schema/users'

dotenv.config({ path: '.env.local' })

const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 })
const db = drizzle(client)

await db.insert(users).values([
  {
    email: 'maximekanyinda@gmail.com',
    fullName: 'Maxime Mulumba',
    role: 'super_admin',
    emailVerified: true,
    passwordHash: await hash('WeareWorking!', 12),
  },
  {
    email: 'sandilet@gmail.com',
    fullName: 'Sandile Nyawo',
    role: 'super_admin',
    emailVerified: true,
    passwordHash: await hash('WeareWorking!', 12),
  },
  {
    email: 'admin@user.com',
    fullName: 'Admin User',
    role: 'admin',
    emailVerified: true,
    passwordHash: await hash('WeareWorking!', 12),
  },
]).onConflictDoNothing()

console.log('✅ Seed users created')
await client.end()