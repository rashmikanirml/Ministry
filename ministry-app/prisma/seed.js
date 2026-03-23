const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "System Administrator",
      username: "admin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      division: "ICT",
    },
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      name: "Ministry Staff",
      username: "staff",
      passwordHash: userPassword,
      role: Role.USER,
      division: "Administration",
    },
  });

  const printers = [
    { serialCode: "FIN-HP-001", model: "HP LaserJet M404dn", division: "Finance" },
    { serialCode: "ADM-CAN-002", model: "Canon imageCLASS LBP214dw", division: "Administration" },
    { serialCode: "ICT-BRO-003", model: "Brother HL-L8360CDW", division: "ICT" },
    { serialCode: "HR-HP-004", model: "HP LaserJet Pro MFP M428fdw", division: "Human Resources" },
  ];

  for (const printer of printers) {
    await prisma.printer.upsert({
      where: { serialCode: printer.serialCode },
      update: { model: printer.model, division: printer.division },
      create: printer,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
