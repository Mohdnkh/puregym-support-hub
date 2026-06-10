const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const data = {
    scripts: await prisma.script.findMany(),
    userQuickScripts: await prisma.userQuickScript.findMany(),
    userShortcuts: await prisma.userShortcut.findMany()
  };

  console.log(JSON.stringify(data, null, 2));
  await prisma.$disconnect();
})();
