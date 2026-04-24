import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@asksenopati.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin-change-me";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin Senopati";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`✓ Admin sudah ada: ${adminEmail} (role=${existing.role})`);
  } else {
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Admin dibuat: ${user.email} (password: ${adminPassword})`);
    console.log("  Harap ganti password setelah login pertama.");
  }

  const tutorEmail = "tutor.demo@asksenopati.com";
  const existingTutor = await prisma.user.findUnique({ where: { email: tutorEmail } });
  if (!existingTutor) {
    await prisma.user.create({
      data: {
        email: tutorEmail,
        name: "Pak Reza Demo",
        passwordHash: await bcrypt.hash("tutor-demo-1234", 10),
        role: "tutor",
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Tutor demo dibuat: ${tutorEmail} (password: tutor-demo-1234)`);
  }

  const studentEmail = "siswa.demo@asksenopati.com";
  const existingStudent = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        email: studentEmail,
        name: "Alya Pertiwi",
        passwordHash: await bcrypt.hash("siswa-demo-1234", 10),
        role: "student",
        school: "SMA Negeri 3 Jakarta",
        grade: "11",
        emailVerified: new Date(),
      },
    });
    console.log(`✓ Siswa demo dibuat: ${studentEmail} (password: siswa-demo-1234)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
