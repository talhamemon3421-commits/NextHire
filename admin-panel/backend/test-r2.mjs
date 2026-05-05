import { fetchProfilePicture } from './src/services/r2.service.js';

async function testR2() {
  try {
    console.log("Testing fetchProfilePicture...");
    await fetchProfilePicture("employer-profile-pictures/test.png");
  } catch (err) {
    console.error("R2 Error:", err.message);
  }
}
testR2();
