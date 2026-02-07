import { seedStaff } from "./src/lib/db/seed-staff.ts";

console.log("Starting staff seed...");
seedStaff()
  .then(() => console.log("Seed completed successfully"))
  .catch((err) => console.error("Seed failed:", err));
