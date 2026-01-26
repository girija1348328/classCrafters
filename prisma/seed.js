const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create Academic Session
  const academicSession = await prisma.academicSession.create({
    data: {
      name: "2027-2028",
      startDate: new Date("2027-04-01"),
      endDate: new Date("2028-03-31"),
      isActive: true
    }
  });

  // 2️⃣ Create Classroom
  const classroom = await prisma.classroom.create({
    data: {
      name: "Class X",
      subject: "General",
      description: "Main classroom",
      teacherId: 1
    }
  });

  // 3️⃣ Create Sections (linked to Classroom)
  await prisma.section.createMany({
    data: [
      { name: "Section A", classId: classroom.id },
      { name: "Section B", classId: classroom.id }
    ]
  });

  console.log("✅ Academic Session, Classroom & Sections seeded");
}


main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
