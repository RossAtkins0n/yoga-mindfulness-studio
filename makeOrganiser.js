import { initDb } from "./models/_db.js";
import { UserModel } from "./models/userModel.js";

await initDb();

const email = "ross1@gmail.com"; // my email

const user = await UserModel.findByEmail(email);

if (!user) {
  console.log("User not found");
  process.exit(1);
}

await UserModel.update(user._id, { role: "organiser" });
console.log(`Updated ${email} to organiser`);
process.exit(0);