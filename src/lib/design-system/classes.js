// src/lib/design-system/classes.js
export const designClasses = {
  // Typography (unchanged)
  typography: {
    tagline: 'text-m font-semibold uppercase', // font-medium = 500
    h1: 'text-4xl lg:text-5xl font-bold leading-tight',                          // font-bold = 700
    h2: 'text-3xl lg:text-4xl font-bold leading-tight',                     // font-semibold = 600
    h3: 'text-2xl lg:text-3xl font-semibold leading-tight',                     // font-semibold = 600
    body: 'text-base leading-relaxed font-medium',                              // font-normal = 400
    bodyLarge: 'text-lg leading-relaxed font-medium',                           // font-normal = 400
    bodySmall: 'text-sm leading-relaxed font-medium'                            // font-normal = 400
  },

  textColors: {
    // For light backgrounds
    light: {
      heading: 'text-body',
      tagline: 'text-heading',
      body: 'text-tagline'
    },
    // For dark backgrounds  
    dark: {
      heading: 'text-white',            // White for headings on dark
      tagline: 'text-white',            // White for tagline on dark  
      body: 'text-white'                // White for body on dark
    }
  },

  container: {
    standard: "space-y-4",
    big: "space-y-6",
    compact: "space-y-2",


  },

  // Content alignment (unchanged)
  contentAlignment: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  },

  // Rich text spacing - UPDATED
  richText: {
    container: 'space-y-4' // Controls ALL spacing between elements
  },


  // NEW: Text + Image layouts
  textImageLayouts: {
    above: 'flex flex-col gap-6',
    above_left: 'flex flex-col gap-6 items-start',
    below: 'flex flex-col-reverse gap-6',
    left: 'flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start',
    right: 'flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 lg:items-start'
  },
  
  // NEW: Image sizes for different positions
  imageSizes: {
    above_left: {
      small: 'w-full max-w-md',        // ← NEW: no mx-auto for left alignment
      medium: 'w-full max-w-2xl',
      large: 'w-full'
    },
    left: {
      small: 'lg:w-1/4',
      medium: 'lg:w-2/5', 
      large: 'lg:w-3/5'
    },
    right: {
      small: 'lg:w-1/4',
      medium: 'lg:w-2/5',
      large: 'lg:w-3/5'
    },
    above: {
      small: 'w-full max-w-md mx-auto',
      medium: 'w-full max-w-2xl mx-auto',
      large: 'w-full'
    },
    below: {
      small: 'w-full max-w-md mx-auto', 
      medium: 'w-full max-w-2xl mx-auto',
      large: 'w-full'
    }
  },
  
  // NEW: Text content sizing
  textContent: {
    left: 'lg:flex-1',
    right: 'lg:flex-1',
    above: 'w-full',
    below: 'w-full'
  },

  buttons: {
    base: 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors',
    primary: 'bg-primary text-white hover:bg-primary/90'
  },
};

export function getContentClasses(alignment="left", theme="light") {
  const textColors = designClasses.textColors[theme];
  return {
    container: `${designClasses.container.standard} ${designClasses.contentAlignment[alignment]}`,
    tagline: `${designClasses.typography.tagline} ${textColors.tagline}`,
    headline: `${designClasses.typography.h2} ${textColors.heading}`,
    content: `${designClasses.typography.body} ${textColors.body}` 
  }
  
}


export function getRichTextClasses(alignment = 'left', theme = 'light') {
  const textColors = designClasses.textColors[theme];
  
  return {
    container: `${designClasses.richText.container} ${designClasses.contentAlignment[alignment]}`,
    tagline: `${designClasses.typography.tagline} ${textColors.tagline}`,
    headline: `${designClasses.typography.h2} ${textColors.heading}`,
    content: `${designClasses.typography.body} ${textColors.body}`
  };
}


export function getTextImageClasses(imagePosition, alignment, imageSize, theme = 'light') {
  const textColors = designClasses.textColors[theme];
  
  return {
    container: `${designClasses.textImageLayouts[imagePosition]} ${designClasses.contentAlignment[alignment]}`,
    image: designClasses.imageSizes[imagePosition]?.[imageSize] || '',
    textContent: `${designClasses.textContent[imagePosition]} space-y-4`,
    tagline: `${designClasses.typography.tagline} ${textColors.tagline}`,
    headline: `${designClasses.typography.h2} ${textColors.heading}`,
    content: `${designClasses.typography.body} ${textColors.body}`,
    button: `${designClasses.buttons.base} ${designClasses.buttons.primary} mt-4`}
  };