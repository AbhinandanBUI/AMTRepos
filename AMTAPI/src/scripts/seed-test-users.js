import mongoose from "mongoose";
import { UserLoginType, UserRolesEnum } from "../constants.js";
import connectDB from "../db/index.js";
import { User } from "../model/user.model.js";

const testUsers = [
  { username: "agile.admin", emailName: "agile-admin", fullName: "Agile Test Admin", role: UserRolesEnum.AGILE_ADMIN },
  { username: "scrum.master", emailName: "scrum-master", fullName: "Test Scrum Master", role: UserRolesEnum.SCRUM_MASTER },
  { username: "product.owner", emailName: "product-owner", fullName: "Test Product Owner", role: UserRolesEnum.PRODUCT_OWNER },
  { username: "agile.developer", emailName: "agile-developer", fullName: "Agile Test Developer", role: UserRolesEnum.DEVELOPER },
];

const requiredPassword = process.env.TEST_USER_PASSWORD;
const emailDomain = (process.env.TEST_USER_EMAIL_DOMAIN || "example.test").trim().toLowerCase();

if (process.env.NODE_ENV === "production") {
  throw new Error("Test users cannot be seeded in production.");
}
if (process.env.ALLOW_TEST_USER_SEED !== "true") {
  throw new Error("Set ALLOW_TEST_USER_SEED=true to explicitly enable test-user seeding.");
}
if (!requiredPassword || !/^\d{6}$/.test(requiredPassword)) {
  throw new Error("TEST_USER_PASSWORD must be set to exactly 6 digits.");
}
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(emailDomain)) {
  throw new Error("TEST_USER_EMAIL_DOMAIN must be a valid test email domain.");
}

try {
  await connectDB();

  for (const testUser of testUsers) {
    const email = `${testUser.emailName}@${emailDomain}`;
    const existingUser = await User.findOne({ email }).select("+isTestAccount");

    if (existingUser && !existingUser.isTestAccount) {
      throw new Error(`Refusing to modify non-test account ${email}.`);
    }

    if (existingUser) {
      existingUser.username = testUser.username;
      existingUser.fullName = testUser.fullName;
      existingUser.role = testUser.role;
      existingUser.isEmailVerified = true;
      existingUser.isActive = true;
      existingUser.loginType = UserLoginType.EMAIL_PASSWORD;
      await existingUser.save();
      console.log(`Updated ${email} (${testUser.role}); existing password retained.`);
      continue;
    }

    await User.create({
      username: testUser.username,
      email,
      fullName: testUser.fullName,
      password: requiredPassword,
      role: testUser.role,
      loginType: UserLoginType.EMAIL_PASSWORD,
      isEmailVerified: true,
      isActive: true,
      isTestAccount: true,
    });
    console.log(`Created ${email} (${testUser.role}).`);
  }
} catch (error) {
  console.error("Test-user seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}