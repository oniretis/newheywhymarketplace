import { db } from "./src/lib/db";
import { staff } from "./src/lib/db/schema/staff-schema";
import { user } from "./src/lib/db/schema/auth-schema";

async function checkStaffData() {
  try {
    console.log("Checking staff data...");

    // Check users
    const users = await db.select().from(user);
    console.log("Users found:", users.length);
    users.forEach((u) => {
      console.log(`- ${u.name} (${u.email})`);
    });

    // Check staff
    const staffRecords = await db.select().from(staff);
    console.log("Staff records found:", staffRecords.length);
    staffRecords.forEach((s) => {
      console.log(`- Staff ID: ${s.id}, User ID: ${s.userId}, Role: ${s.role}`);
    });
  } catch (error) {
    console.error("Error checking data:", error);
  }
}

checkStaffData();
