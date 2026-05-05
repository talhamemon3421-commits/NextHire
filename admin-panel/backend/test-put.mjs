import { uploadProfilePicture } from './src/services/r2.service.js';

async function testR2Upload() {
  try {
    const dummyBuffer = Buffer.from('test image content', 'utf-8');
    const url = await uploadProfilePicture(dummyBuffer, 'image/png', 'test-upload.png');
    console.log("SUCCESS. Upload returned URL:", url);
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
  }
}
testR2Upload();
