const sharp = require('sharp');
const path = require('path');

async function main() {
  console.log('Generating transparent icons and favicons from public/favicon_transparent.png...');
  const src = path.resolve(__dirname, '../public/favicon_transparent.png');
  const publicDir = path.resolve(__dirname, '../public');

  const transparentMasterBuffer = await sharp(src)
    .png()
    .toBuffer();

  await sharp(transparentMasterBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-circle.png'));
  console.log('✓ Created transparent favicon-circle.png');

  await sharp(transparentMasterBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created transparent favicon.ico');

  await sharp(transparentMasterBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'app-icon-192.png'));
  console.log('✓ Created transparent app-icon-192.png');

  await sharp(transparentMasterBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'app-icon-512.png'));
  console.log('✓ Created transparent app-icon-512.png');

  const iconOnDark = await sharp(transparentMasterBuffer)
    .resize(156, 156, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 6, g: 11, b: 20, alpha: 1 },
    },
  })
    .composite([{ input: iconOnDark, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created crisp mobile apple-touch-icon.png');

  console.log('All transparent icons generated successfully!');
}

main().catch(console.error);
