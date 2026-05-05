import { getProfilePictureBuffer } from './src/services/r2.service.js';

async function testR2() {
  try {
    const { fetchProfilePicture } = await import('./src/services/r2.service.js');
    console.log("Testing fetchProfilePicture...");
    // Let's just fetch some random file, or see if it throws credentials error
    await fetchProfilePicture("employer-profile-pictures/test.png");
  } catch (err) {
    console.error("R2 Error:", err.message);
    console.error(err);
  }
}
testR2();
