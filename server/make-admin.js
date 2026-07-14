import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Please provide an email address. Usage: node make-admin.js <email>');
    process.exit(1);
  }

  try {
    const [updatedUser] = await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (updatedUser) {
      console.log(`✅ Success! The user ${email} is now an admin.`);
    } else {
      console.log(`⚠️  User with email ${email} not found.`);
    }
  } catch (err) {
    console.error('❌ Error updating user:', err);
  } finally {
    process.exit(0);
  }
}

makeAdmin();
