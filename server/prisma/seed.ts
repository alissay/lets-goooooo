import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create seed user
  const user = await prisma.user.upsert({
    where: { id: "seed-user" },
    update: {},
    create: { id: "seed-user" },
  });

  const userId = user.id;

  // Goals
  const workGoal = await prisma.goal.create({
    data: {
      title: "Ship a demo-ready, design-reviewed app with Brian",
      domain: "WORK",
      userId,
    },
  });

  const fitnessGoal1 = await prisma.goal.create({
    data: {
      title: "Get to the gym consistently - 3x/week",
      domain: "FITNESS",
      userId,
    },
  });

  const fitnessGoal2 = await prisma.goal.create({
    data: {
      title: "Build strength and feel better in my body",
      domain: "FITNESS",
      userId,
    },
  });

  const adminGoal = await prisma.goal.create({
    data: {
      title: "Get a clear picture of my financial situation - no more avoidance",
      domain: "ADMIN",
      userId,
    },
  });

  // Work tasks
  const workTasks = [
    {
      title: "Draft list of open MC questions for team review",
      firstStep: "Open Mission Control and scan for any unanswered question threads",
    },
    {
      title: "Prep Brian's Day 1 onboarding - how we work with AI now",
      firstStep: "Open a doc and write the 3 most important things Brian needs to know about the new workflow",
    },
    {
      title: "Create master app audit list for Brian",
      firstStep: "Open the app and screenshot the first screen you'd want reviewed",
    },
    {
      title: "Assign MC questions to Doug / Michael / Lucija",
      firstStep: "Copy the questions list and paste into a Slack message draft",
    },
  ];

  for (const task of workTasks) {
    await prisma.task.create({
      data: { ...task, domain: "WORK", userId, goalId: workGoal.id },
    });
  }

  // Fitness tasks
  const fitnessTasks = [
    {
      title: "Open Fitbod and log one workout this week",
      firstStep: "Open the Fitbod app right now",
      goalId: fitnessGoal1.id,
    },
    {
      title: "Pick 3 gym days per week and add to calendar",
      firstStep: "Open your calendar and find 3 slots that realistically work",
      goalId: fitnessGoal1.id,
    },
    {
      title: "Define specific body goals for Fitbod setup",
      firstStep: "Write down 3 things you want to feel or look different in 90 days",
      goalId: fitnessGoal2.id,
    },
  ];

  for (const task of fitnessTasks) {
    await prisma.task.create({
      data: { ...task, domain: "FITNESS", userId },
    });
  }

  // Nutrition tasks
  const nutritionTasks = [
    {
      title: "Buy supplement stack: Fish oil (high EPA), Magnesium Glycinate, Vitamin D3+K2, L-Theanine, Methylated B-complex",
      firstStep: "Open Amazon or iHerb and search 'high EPA fish oil'",
    },
    {
      title: "Identify 3-4 high-protein meals I actually enjoy (sweet-leaning, no beef/pork)",
      firstStep: "Think of the last meal that felt satisfying and protein-forward - write it down",
    },
    {
      title: "Pick one meal prep day per week",
      firstStep: "Look at next week and identify one 2-hour window that could work",
    },
    {
      title: "Set a soft weekly alcohol intention",
      firstStep: "Pick a number that feels realistic and kind, not punishing",
    },
  ];

  for (const task of nutritionTasks) {
    await prisma.task.create({
      data: { ...task, domain: "NUTRITION", userId },
    });
  }

  // Habits tasks
  const habitsTasks = [
    {
      title: "Drink a glass of water before coffee - set a morning reminder",
      firstStep: "Put a glass on your nightstand or next to the coffee maker tonight",
    },
    {
      title: "Walk the dog 10 minutes longer than usual",
      firstStep: "Take a different route at the start so you naturally go further",
    },
    {
      title: "Set up a 5-minute workday close-down routine",
      firstStep: "Write down 3 things you'd want to check before you stop for the day",
    },
    {
      title: "Pick up one room per day - 10 minutes max",
      firstStep: "Pick which room is your day-1 room right now",
    },
  ];

  for (const task of habitsTasks) {
    await prisma.task.create({
      data: { ...task, domain: "HABITS", userId },
    });
  }

  // Admin tasks
  const adminTasks = [
    {
      title: "Spend 30 minutes researching debt relief options",
      firstStep: "Search 'debt consolidation vs debt settlement - which is right for me'",
      goalId: adminGoal.id,
    },
    {
      title: "Gather tax documents",
      firstStep: "Find last year's tax return to see what documents you used",
      goalId: adminGoal.id,
    },
    {
      title: "Set up a simple expense tracking method",
      firstStep: "Open Notes app and type this month's three biggest expenses from memory",
      goalId: adminGoal.id,
    },
    {
      title: "Schedule a 2-hour 'sit with the finances' block",
      firstStep: "Open your calendar and pick a specific date in the next 2 weeks",
      goalId: adminGoal.id,
    },
  ];

  for (const task of adminTasks) {
    await prisma.task.create({
      data: { ...task, domain: "ADMIN", userId },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
