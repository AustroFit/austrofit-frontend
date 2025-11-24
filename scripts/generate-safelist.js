
import { createDirectus, staticToken, rest, readItems } from '@directus/sdk';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const directus = createDirectus(process.env.PUBLIC_CMSURL)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_READ_TOKEN));

async function generateSafelist() {
  try {
    console.log('🔍 Fetching colors from Directus...');
    
    // Execute the readItems function properly
    const colors = await directus.request(readItems('colors'));
    
    console.log('📊 Raw response:', colors);
    console.log('📊 Type of colors:', typeof colors);
    console.log('📊 Is array?', Array.isArray(colors));
    
    if (!Array.isArray(colors) || colors.length === 0) {
      console.log('⚠️  No colors found in collection');
      return;
    }
    
    console.log('📊 Color array length:', colors.length);
    console.log('📊 First color:', colors[0]);
    
    // Generate all background classes
    const bgClasses = colors.map(color => `bg-${color.slug}`);
    
    // Generate text classes for contrast
    const textClasses = ['text-white', 'text-slate-900', 'text-slate-800'];
    
    const allClasses = [...bgClasses, ...textClasses].join(' ');
    
    const safelistContent = `<!-- Auto-generated Tailwind safelist - DO NOT EDIT -->
<!-- Generated: ${new Date().toISOString()} -->
<!-- Classes: ${allClasses} -->

<script>
  // This component exists solely to force Tailwind to include dynamic classes
  // It's never rendered, just scanned by Tailwind during build
</script>`;

    await writeFile('src/lib/tailwind-safelist.svelte', safelistContent);
    console.log('✅ Tailwind safelist generated successfully');
    console.log(`📦 Included ${bgClasses.length} background classes`);
    
  } catch (error) {
    console.error('❌ Error generating safelist:', error);
    console.log('🔍 Error details:', error.message);
    process.exit(1);
  }
}

generateSafelist();