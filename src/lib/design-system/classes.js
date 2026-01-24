import { text } from "@sveltejs/kit";

// src/lib/design-system/classes.js
const spacing = {
    // Vertical spacing between elements
    tight: 'space-y-4',      // 1rem (16px)
    normal: 'space-y-5',     // 1.5rem (24px)
    relaxed: 'space-y-8',    // 2rem (32px)
    loose: 'space-y-10',     // 2.5rem (40px)
    
    // Gaps for flex/grid
    gap: {
      tight: 'gap-4',
      normal: 'gap-6',
      relaxed: 'gap-8',
      loose: 'gap-10'
    }
  };

  const shadows = {
     base: 'shadow-[0_2px_8px_0px_rgba(0,0,0,0.10)]',
  }

export const designClasses = {
  // Typography (unchanged)
  typography: {
    tagline: 'text-[1.11rem] md:text-[1.25rem]  font-montserrat pl-px font-semibold uppercase tracking-[0.18em]', // 
    h1: 'text-[3rem] md:text-5xl font-montserrat font-semibold leading-tight',                          // font-bold = 700
    h2: 'text-[2rem] md:text-4xl font-montserrat font-semibold leading-tight',                     // font-semibold = 600
    h3: 'text-[1.7rem] md:text-3xl font-montserrat font-semibold leading-tight tracking-[0.01em]',
    h4: 'text-[1.4rem] md:text-2xl font-montserrat font-semibold leading-tight' ,                   // font-semibold = 600
    h5: 'text-[1.2rem] md:text-xl font-montserrat font-semibold leading-tight' ,  
    body: 'text-[18px] leading-[1.6]',                             // font-normal = 400
    bodyLarge: 'text-[19px]',                           // font-normal = 400
    bodySmall: 'text-sm',
    bodyDescription: 'text-[21px] leading-[1.45]',
    quote: 'text-[19px] font-light italic leading-[1.45]', 
    h_card: 'text-xl font-montserrat tracking-wider font-semibold'
  },

  textColors: {
    // For light backgrounds
    light: {
      heading: 'text-dark-kvb-blue',
      tagline: 'text-dark-blue-2',
      body: 'text-dark-black',
      bodyDescription: 'text-dark-blue-1'
    },
    // For dark backgrounds  
    dark: {
      heading: 'text-white',
      tagline: 'text-white',
      body: 'text-white',
      bodyDescription: 'text-white'
    }
  },  

  spacing: spacing,
  
  container: {
    standard: `${spacing.normal}`,
    big: `${spacing.relaxed}`,
    compact: `${spacing.tight}`,
    
    
    cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch my-10",
    
    basicCard: "rounded-[0.65rem] overflow-hidden min-h-80 h-full w-full flex flex-col max-w-sm mx-auto lg:max-w-none lg:mx-0",

    eventCard: "bg-white rounded-[0.65rem] overflow-hidden h-full w-full flex flex-col md:flex-row shadow-[0_0_30px_-5px_rgba(0,0,0,0.15)]", 

    cardContent: "p-6 flex flex-col  gap-4 flex-1",

  },

  // Content alignment (unchanged)
  contentAlignment: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  },

 /*  hero: {
    // Base container classes
    section: 'relative',
    sectionFullscreen: 'relative h-screen overflow-hidden',
    container: 'container mx-auto px-4',
    containerRegular: 'py-16',
    containerFullscreen: 'relative z-10 h-full flex items-center',
    
    // Layout classes
    layouts: {
      image_left: 'flex flex-col lg:flex-row-reverse items-center gap-12',
      image_right: 'flex flex-col lg:flex-row items-center gap-12', 
      image_center: 'flex flex-col-reverse items-center text-center gap-12',
      image_full: 'max-w-2xl' // Content wrapper for fullscreen
    },
    
    // Content wrapper classes
    content: {
      regular: 'flex-1',
      centered: 'text-center',
      fullscreen: 'max-w-2xl text-white'
    },
    
    // Image wrapper classes  
    image: {
      regular: 'flex-1 w-full max-w-md lg:max-w-lg',
      fullscreen: 'absolute inset-0',
      fullscreenImg: 'w-full h-full object-cover'
    },
    
    // Typography sizes (larger than regular content)
    typography: {
      tagline: 'text-sm font-medium uppercase tracking-wide mb-4',
      taglineOpacity: {
        regular: 'opacity-75',
        fullscreen: 'opacity-90'
      },
      headline: {
        regular: 'text-4xl lg:text-6xl font-bold leading-tight mb-6',
        fullscreen: 'text-5xl lg:text-7xl font-bold leading-tight mb-6'
      },
      description: {
        regular: 'text-lg lg:text-xl leading-relaxed mb-8',
        fullscreen: 'text-xl lg:text-2xl leading-relaxed mb-8'
      }
    },
    
    // Fullscreen specific
    fullscreen: {
      overlay: 'absolute inset-0 bg-black bg-opacity-40',
      buttonStyle: 'inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors no-underline'
    }
  }, */
    
  cardStyles: {
    darkblue: {
      background: 'bg-dark-kvb-blue',
      textColor: 'text-white',
      headingColor: 'text-white',
      borderColor: 'border-white/20',
      badge: 'inline-block px-3 py-1 bg-light-green-1/50 text-white rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-white/20 text-white rounded text-xs'
    },
    lightgrey: {
      background: 'bg-light-grey',
      textColor: 'text-dark-kvb-blue',
      headingColor: 'text-dark-kvb-blue',
      borderColor : 'border-dark-kvb-blue/10',
      badge: 'inline-block px-3 py-1 bg-light-green-1/80 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    },
    white: {
      background: 'bg-white',
      textColor: 'text-dark-kvb-blue',
      headingColor: 'text-dark-kvb-blue',
      borderColor: 'border-gray-200',
      badge: 'inline-block px-3 py-1 bg-light-green-1/80 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    },
    lightgreen: {
      background: 'bg-light-green-1',
      textColor: 'text-dark-kvb-blue',
      headingColor: 'text-dark-kvb-blue',
      borderColor: 'border-dark-kvb-blue/15',
      badge: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    }
  },

  shadows: {
    light: 'shadow-[0_2px_8px_0px_rgba(0,0,0,0.10)]',
    base: `${shadows.base}`,
    card: `${shadows.base}`,
    cardHover: 'hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.35)]',
    cardLight: 'shadow-[0_2px_8px_0px_rgba(0,0,0,0.10)]',
    cardLightHover: 'hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.25)]',
    none: 'shadow-none'
  },

  imageLayouts: {
  left: `flex flex-col lg:flex-row ${spacing.gap.relaxed} items-start`,
  right: `flex flex-col lg:flex-row-reverse ${spacing.gap.relaxed} items-start`,
  above: `flex flex-col ${spacing.gap.normal} items-center text-center`,
  above_left: `flex flex-col ${spacing.gap.normal} items-start`
},

  // Image sizes
  imageSizeClasses: {
    icon: 'w-32 h-32 object-contain ',
    small: 'w-full max-w-xs',
    medium: 'w-full max-w-md lg:max-w-lg',
    large: 'w-full',
    // For side-by-side layouts
    left_small: 'lg:w-1/4 w-full',
    left_medium: 'lg:w-2/5 w-full',
    left_large: 'lg:w-3/5 w-full',
    right_small: 'lg:w-1/4 w-full',
    right_medium: 'lg:w-2/5 w-full',
    right_large: 'lg:w-3/5 w-full'
  },
  
  /* // NEW: Image sizes for different positions
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
  }, */
  
  // NEW: Text content sizing
  textContent: {
    left: 'lg:flex-1',
    right: 'lg:flex-1',
    above: 'w-full',
    below: 'w-full'
  },

  accordion: {
    container: 'space-y-4 mt-8',
    item: 'border rounded-[0.65rem] overflow-hidden transition-all',
    itemOpen: 'border-dark-blue-1/10 bg-white',
    itemClosed: 'border-dark-blue-1/10 bg-white',

    button: 'font-semibold text-xl w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer transition-colors',

    icon: 'flex-shrink-0 w-6 h-6 transition-transform',
    iconOpen: 'rotate-180',

    content: 'px-6 py-4 prose prose-lg max-w-none bg-light-blue-1/30 rounded-md',
    contentWrapper: ' overflow-hidden px-4 pb-4 transition-all duration-300 ease-in-out',


  },

  faq: {
    container: 'space-y-4 mt-8',
    item: 'border rounded-[0.65rem] overflow-hidden transition-all',
    itemOpen: 'border-dark-blue-1/10 bg-white',
    itemClosed: 'border-dark-blue-1/10 bg-white',

    // Question (clickable header)
    question: 'w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-dark-blue-2/10 transition-colors',
    questionText: 'text-lg font-semibold pr-4',
    questionIcon: 'flex-shrink-0 w-6 h-6 transition-transform',
    questionIconOpen: 'rotate-180',
    
    // Answer (expandable content)
    answer: 'px-6 py-4 prose prose-lg max-w-none',
    answerWrapper: 'overflow-hidden transition-all duration-300 ease-in-out border-t border-dark-blue-1/10'
  },

  buttons: {
  base: 'inline-flex font-montserrat tracking-wider items-center justify-center rounded-md transition-colors border-2 mt-2',
  
  sizes: {
    sm: 'px-5 py-1 text-[14px] font-medium',
    md: 'px-7 py-1.5 text-[15px] font-medium',  
    lg: 'px-10 py-1.5 text-[18px] font-semibold uppercase tracking-widest mt-5'     
  },
   
  styles: {
    primary: 'border-dark-blue-2 bg-dark-blue-2 text-white hover:bg-dark-blue-2/90 hover:border-dark-blue-2/90',
    pink: 'border-dark-pink-1 bg-dark-pink-1 text-white hover:bg-dark-pink-1/90 hover:border-dark-pink-1/90',
    green: 'border-dark-green-1  bg-dark-green-1  text-white hover:bg-dark-green-1 /90 hover:border-dark-green-1 /90',
    pink_outline: 'border-dark-pink-1 bg-transparent text-dark-pink-1 hover:bg-dark-pink-1 hover:text-white',
    blue_outline: 'border-dark-blue-2 bg-transparent text-dark-blue-2 hover:bg-dark-blue-2 hover:text-white',
    green_outline: 'border-dark-green-1 bg-transparent text-dark-green-1 hover:bg-dark-green-1 hover:text-white',
  }
},


  //BACKUP MAIN NAVBAR
    mainNavbar: {
    container: "w-full flex bg-light-grey h-[80px] font-montserrat",
    leftSpacer: "bg-dark-kvb-blue grow h-full",
    rightSpacer: "grow h-full",
    content: "basis-[1140px] flex items-center",
    logo: "bg-dark-kvb-blue flex-none h-full flex items-center pr-20 text-light-white font-bold rounded-br-[45%_100%]",
    logoLink: "text-light-white no-underline",
    logoImage: "max-h-15",
    menuArea: "flex-1 flex items-center justify-end whitespace-nowrap h-full",
    menuList: "flex gap-6",
    },

  mainNavItem: {
    // Main nav item with named group
    container: "relative group/main",
    link: 'text-dark-kvb-blue text-[15px] tracking-wide hover:text-dark-kvb-blue/70 font-medium transition-colors py-2',
    linkActive: 'text-dark-kvb-blue/70 border-b-2 border-dark-kvb-blue/70',
    
    // First level dropdown
    dropdown: 'absolute top-full left-0 mt-4 bg-light-grey border border-light-blue-1 rounded-[0.65rem] shadow-lg opacity-0 invisible group-hover/main:opacity-100 group-hover/main:visible transition-all duration-200 min-w-48 z-50',
    dropdownItem: 'border-b border-light-blue-1 last:border-b-0',
    
    // Clickable dropdown item area
    dropdownItemLink: 'block text-[15px] tracking-wide px-4 py-2 text-dark-kvb-blue hover:text-dark-kvb-blue/70 hover:bg-light-grey/70 font-medium transition-colors',
    dropdownItemSpan: 'block px-4 py-2 text-dark-kvb-blue',
    
    // Nested nav item with its own named group
    nestedContainer: "relative group/nested",
    
    // Second level dropdown
    nestedDropdown: 'absolute top-0 left-full ml-1 bg-light-grey border border-light-blue-1 rounded-[0.65rem] shadow-lg opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-200 min-w-48 z-50 [.menu-right-edge_&]:left-auto [.menu-right-edge_&]:right-full [.menu-right-edge_&]:mr-1 [.menu-right-edge_&]:ml-0'
  },

  



  heroFullscreen: {
  container: 'relative h-screen max-h-[600px] ',
  image: 'absolute inset-0 md:w-full h-full object-cover',
  overlay: 'absolute inset-0 bg-black/0',
  contentWrapper: 'relative z-10 h-full flex items-end pb-16',
  contentContainer: 'container mx-auto px-4 max-w-[1140px]',
  textWrapper: 'md:max-w-[700px] space-y-3',
  
  // Text styles with line-specific backgrounds
  tagline: 'bg-dark-kvb-blue px-4 py-2 text-white text-sm font-medium uppercase tracking-[0.02em] leading-[1.55] box-decoration-clone',
  headline: 'text-[1.8rem] md:text-[2.5rem] lg:text-[2.5rem] font-semibold tracking-[0.02em] leading-[1.6]',
  headlineSpan: 'bg-dark-kvb-blue px-4 py-1 text-white box-decoration-clone', // 64px height ≈ py-4
  description: 'text-lg lg:text-xl tracking-[0.02em] leading-[1.55]',
  descriptionSpan: 'bg-dark-kvb-blue px-4 py-2 text-white box-decoration-clone',
  
  buttonWrapper: 'mt-6 pt-3',
  button: 'inline-block px-8 py-4 bg-light-green-1 text-dark-kvb-blue rounded-lg font-medium hover:bg-light-green-1/90 transition-colors'
  },

  footer: {
    section: 'relative overflow-hidden',
    container: 'container mx-auto px-4 pt-16 pb-4 max-w-[1140px]',
    grid: 'grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16', // ← Changed to 12-column grid
    
    // Column sizes (adjust as needed)
    column1: 'md:col-span-5', // ← Wider for description + button
    column2: 'md:col-span-3', // ← Medium for nav
    column3: 'md:col-span-4', // ← Slightly wider for contact
    
    columnContent: 'space-y-6',
    description: 'text-base leading-relaxed',
    
    nav: 'space-y-3',
    navLink: 'block  hover:text-light-green-1 transition-colors',
    
    contactSection: 'space-y-3',
    contactTitle: 'font-medium',
    contactLink: 'block hover:text-light-green-1 transition-colors underline',
    
    // Legal nav - horizontal strip
    legalNavStrip: 'border-t border-white/20 pt-8 mt-12',
    legalNav: 'flex flex-wrap gap-6 justify-center',
    legalLink: 'text-sm hover: transition-colors',
    
    // Copyright strip
    copyrightStrip: 'border-t border-white/20 pt-4 mt-8',
    copyright: 'text-sm text-center'
  }
};


export function getMainNavClasses() {
  return designClasses.mainNavbar;
}

export function getNavItemClasses(isActive = false, mobile = false) {
  if (mobile) {
    return isActive ? 'font-semibold' : '';
  }
  
  const base = designClasses.mainNavItem.link;
  const active = isActive ? designClasses.mainNavItem.linkActive : "";
  return `${base} ${active}`;
}

export function getBaseBlockClasses(alignment = 'left', theme = 'light', overrides = {}) {
  const textColors = designClasses.textColors[theme];

  return {
    container: overrides.container || `${designClasses.container.standard} ${designClasses.contentAlignment[alignment]}`,
    tagline: overrides.tagline || `${designClasses.typography.tagline} ${textColors.tagline}`,
    headline: overrides.headline || `${designClasses.typography.h2} ${textColors.heading}`,
    description: overrides.description || `${designClasses.typography.bodyDescription} ${textColors.bodyDescription}`,
    content: overrides.content || `${designClasses.typography.body} ${textColors.body}`,
    contentAlignment: designClasses.contentAlignment[alignment],
    ...overrides
  }
}

//this is for manually generated pages
export function getBasePageClasses(alignment = 'left', theme = 'light') {
  const textColors = designClasses.textColors[theme];

  return {
    pageContainer: "container-standard py-6",
    tagline: `${designClasses.typography.tagline} ${textColors.tagline}`,
    h1: `${designClasses.typography.h1} ${textColors.heading}`,
    h2: `${designClasses.typography.h2} ${textColors.heading}`,
    h3: `${designClasses.typography.h3} ${textColors.heading}`,
    h4: `${designClasses.typography.h4} ${textColors.heading}`,
    h5: `${designClasses.typography.h5} ${textColors.heading}`,
    h6: `${designClasses.typography.h6} ${textColors.heading}`,
    description:`${designClasses.typography.bodyDescription} ${textColors.bodyDescription}`,
    content: `${designClasses.typography.body} ${textColors.body}`,
    contentAlignment: designClasses.contentAlignment[alignment],
  }
}

export function getHeroClasses(layout = 'image_right', theme = 'light') {
  const isFullscreen = layout === 'image_full';
  const textColors = designClasses.textColors[isFullscreen ? 'dark' : theme];
  
  const layoutClasses = {
    image_left: 'flex flex-col lg:flex-row items-center gap-12',
    image_right: 'flex flex-col lg:flex-row-reverse items-center gap-12',
    image_top: 'flex flex-col items-center text-center gap-8'
  };
  
  // Return fullscreen-specific classes (always dark theme)
  if (isFullscreen) {
    return designClasses.heroFullscreen;
  }
  
  // Return regular hero classes with theme support
  return {
    tagline: `${designClasses.typography.tagline} ${textColors.tagline} mb-4`,
    headline: `text-4xl lg:text-6xl font-bold leading-tight mb-6 ${textColors.heading}`,
    description: `text-lg lg:text-xl leading-[1.45] mb-8 ${textColors.description}`,
    layout: layoutClasses[layout] || layoutClasses.image_right,
    content: 'flex-1',
    imageWrapper: 'flex-1 w-full max-w-md lg:max-w-lg',
    image: 'w-full h-auto rounded-[0.65rem] shadow-lg'
  };
}

export function getCardGalleryClasses(alignment="center", theme="light") {
  const textColors = designClasses.textColors[theme];

  return {
    container: `${designClasses.container.standard} ${designClasses.contentAlignment[alignment]}`,
    cardGrid: `${designClasses.container.cardGrid}`,
    tagline: `${designClasses.typography.tagline} ${textColors.tagline}`,
    headline: `${designClasses.typography.h2} ${textColors.heading}`,
  }
}

export function getEmbedClasses(alignment="left", theme="light") {
  const textColors = designClasses.textColors[theme];

  return {

    wrapper: 'relative w-full',
    container: 'relative min-h-[50px]',
    // State containers
    loadingState: 'flex flex-col items-center justify-center bg-surface rounded-lg px-8 py-12 text-center',
    errorState: 'flex flex-col items-center justify-center bg-error-light rounded-lg px-8 py-12 text-center absolute inset-0',
    
    // Loading spinner
    spinner: 'w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mb-4',
    loadingText: 'text-base text-text-muted',
    
    // Error state
    errorIcon: 'mb-4 text-error',
    errorText: 'text-error-dark',
    retryButton: 'mt-4 px-6 py-2 bg-error text-white border-0 rounded cursor-pointer text-base font-medium transition-opacity hover:opacity-90',
    
    // Noscript warning
    noscriptWarning: 'bg-warning-light border-2 border-warning rounded-lg p-6 my-8 text-center flex flex-col items-center gap-3',
    noscriptIcon: 'text-warning-dark',
    noscriptText: 'text-warning-dark font-medium m-0',
    
    // Provider branding
    providerBranding: 'mt-8 text-center opacity-80 transition-opacity hover:opacity-100',
    providerLogo: 'max-w-[150px] h-auto !border-0',
  }
}

export function getCardClasses(cardAlignment = 'center', cardStyle = "light-grey", hasImage = false) {
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.lightgrey;
  
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  };
  
  const buttonAlignmentClasses = {
    left: 'self-start',
    center: 'self-center',
    right: 'self-end'
  };

  return {
    image: hasImage ? 'w-full h-60 object-cover flex-shrink-0' : 'hidden',
    container: `${style.background} rounded-[0.65rem] overflow-hidden min-h-40 h-full w-full flex flex-col max-w-sm mx-auto lg:max-w-none lg:mx-0 ${designClasses.shadows.cardLight}`,
    cardContent: `p-6 pb-8 gap-3 flex flex-col flex-1 ${alignmentClasses[cardAlignment]} ${!hasImage ? 'justify-center' : ''}`, // ← Add justify-center when no image
    headline: `${designClasses.typography.h_card} ${style.headingColor}`,
    content: `${designClasses.typography.body} ${style.textColor} ${hasImage ? 'flex-1' : ''}`, // ← Only flex-1 with image
    button: `${designClasses.buttons.base} ${designClasses.buttons.sizes.sm} ${designClasses.buttons.styles.pink} ${buttonAlignmentClasses[cardAlignment]} ${hasImage ? 'mt-2' : 'mt-4'}`,
  }
}

export function getEventCardClasses(cardStyle = 'lightgrey', cardAlignment = 'left', columns = 3) {
  // Get card style config
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.lightgrey;

  // Alignment classes for content
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  };
  
  const buttonAlignmentClasses = {
    left: 'self-start',
    center: 'self-center',
    right: 'self-end'
  };

  const badgeStyles = {
    darkblue: {
      badge: 'inline-block px-3 py-1 bg-light-green-1/50 text-white rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-white/20 text-white rounded text-xs'
    },
    lightgrey: {
      badge: 'inline-block px-3 py-1 bg-light-green-1/80 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    },
    white: {
      badge: 'inline-block px-3 py-1 bg-light-green-1/80 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    },
    lightgreen: {
      badge: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeOnline: 'inline-block px-3 py-1 bg-dark-kvb-blue/10 text-dark-kvb-blue rounded-full text-sm font-medium',
      badgeState: 'inline-block px-3 py-1 bg-dark-kvb-blue/5 text-dark-kvb-blue rounded text-xs'
    }
  };

  const borderColors = {
    darkblue: 'border-white/20',
    lightgrey: 'border-dark-kvb-blue/10',
    white: 'border-gray-200',
    lightgreen: 'border-dark-kvb-blue/15'
  };
  const borderColor = borderColors[cardStyle] || borderColors.lightgrey;

  const badges = badgeStyles[cardStyle] || badgeStyles.lightgrey;
  
  const isHorizontal = columns < 2; // 1-2 columns = horizontal, 3+ = vertical
  
  const layoutClasses = isHorizontal 
    ? 'flex-col md:flex-row' // Horizontal on tablet+
    : 'flex-col'; // Always vertical
    
  const imageClasses = isHorizontal
    ? 'w-full h-48 md:w-2/5 md:h-auto object-cover flex-shrink-0'
    : 'w-full h-48 object-cover flex-shrink-0';
  
  return {
    //container: `${style.background} rounded-[0.65rem] overflow-hidden h-full w-full flex flex-col md:flex-row ${designClasses.shadows.card}`,
    //image: 'w-full h-64 md:w-2/5 md:h-auto object-cover flex-shrink-0',
    container: `${style.background} rounded-[0.65rem] overflow-hidden h-full w-full flex ${layoutClasses} ${designClasses.shadows.card}`,
    image: imageClasses,
    content: `flex-1 p-8 flex flex-col gap-4 ${alignmentClasses[cardAlignment]}`, // ← Added alignment
    title: `${designClasses.typography.h3} ${style.headingColor}`,
    description: `${designClasses.typography.body} ${style.textColor} flex-1`,
    
    // Meta Banner
    metaBanner: `flex flex-row w-full gap-3 py-4 border-t border-b ${borderColor}`,
    metaItem: `${designClasses.typography.bodySmall} ${style.textColor} flex items-center gap-2`,
    metaIcon: 'text-base',
    
    // Badges
    badges: 'flex flex-wrap gap-2',
    badge: badges.badge,
    badgeOnline: badges.badgeOnline,
    badgeState: badges.badgeState,
    
    //button: `${designClasses.buttons.base} ${designClasses.buttons.sizes.md} ${designClasses.buttons.styles.accent_pink} mt-auto ${buttonAlignmentClasses[cardAlignment]}` // ← Added alignment to button
  };
}

export function getListItemClasses(cardStyle = 'light-grey') {
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.lightgrey;
  
  return {
    container: `${style.background} flex items-center justify-between gap-4 px-6 py-4 rounded-[0.65rem] ${designClasses.shadows.cardLight} hover:${designClasses.shadows.cardLightHover} transition-shadow border border-transparent hover:border-${style.textColor.replace('text-', 'border-')}/10`,
    title: `${designClasses.typography.h5} ${style.headingColor} flex-1`,
    date: `${designClasses.typography.bodySmall} ${style.textColor} opacity-75 whitespace-nowrap`
  }
}

export function getJobCardClasses(cardStyle = 'lightgrey', cardAlignment = 'left') {
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.lightgrey;
  
  return designClasses.accordion;
}

export function getTestimonialCardClasses(cardStyle = 'lightgrey', cardAlignment = 'left') {
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.beige;
  
  const alignmentClasses = designClasses.contentAlignment;
  
  return {
    container: `${style.background} rounded-[0.65rem] p-8 h-full flex flex-col gap-6  ${designClasses.shadows.cardLight} ${alignmentClasses[cardAlignment]}`,
    
    quoteIcon: `${style.textColor} opacity-20`,
    
    quote: `${designClasses.typography.quote} ${style.textColor} opacity-80 flex-1`,
    
    author: 'flex items-center gap-4 pt-4 border-t border-dark-kvb-blue/10',
    
    avatarWrapper: 'flex-shrink-0',
    avatar: 'w-12 h-12 rounded-full object-cover',
    avatarPlaceholder: `w-12 h-12 rounded-full ${style.background === 'bg-light-beige' ? 'bg-dark-kvb-blue/10' : 'bg-white/20'} flex items-center justify-center text-sm font-semibold ${style.textColor}`,
    
    authorInfo: 'flex-1 min-w-0',
    authorName: `${designClasses.typography.bodySmall} font-semibold ${style.headingColor}`,
    authorMeta: `${designClasses.typography.bodySmall} ${style.textColor} opacity-70 mt-1`,
    separator: 'mx-2'
  };
}

export function getSupporterCardClasses() {
  return {
    container: 'w-full h-full flex items-center justify-center',
    logo: 'grayscale max-w-full max-h-full object-contain ',
  }
}

export function getTeamCardClasses(cardStyle ='lightrey', cardAlignment = 'center') {
  const style = designClasses.cardStyles[cardStyle] || designClasses.cardStyles.beige;
  
  const alignmentClasses = designClasses.contentAlignment;
  
  return {
    container: `${style.background} items-center rounded-[0.65rem] p-8 h-full flex flex-col gap-2  ${designClasses.shadows.cardLight} ${alignmentClasses[cardAlignment]}`,
    image: 'w-64 h-64 rounded-full object-cover mb-4',
    placeholder: 'w-64 h-64 rounded-full bg-dark-blue-1/10 flex items-center justify-center mb-4',
    icon: "w-48 h-48 text-dark-blue-1/30",
    name: `${designClasses.typography.h4}`,
    job_title: `${designClasses.typography.bodySmall}`,
    quote: `${designClasses.typography.quote} ${style.textColor} opacity-80 flex-1`,
    
  }
}

export function getContentBlockClasses(alignment = 'left', theme = 'light', imagePosition = null, imageSize = 'medium') {
  const textColors = designClasses.textColors[theme];
  const base = getBaseBlockClasses(alignment, theme, {
    headline: `${designClasses.typography.h3} ${textColors.heading}`,
  });
  
  const isSideImage = imagePosition === 'left' || imagePosition === 'right';
  const isIcon = imageSize === 'icon';
  
  let imageSizeClass;
  if (isIcon) {
    imageSizeClass = designClasses.imageSizeClasses.icon;
  } else if (isSideImage) {
    imageSizeClass = designClasses.imageSizeClasses[`${imagePosition}_${imageSize}`] || designClasses.imageSizeClasses.medium;
  } else {
    imageSizeClass = designClasses.imageSizeClasses[imageSize] || designClasses.imageSizeClasses.medium;
  }
  
  return {
    ...base,
    layout: imagePosition ? designClasses.imageLayouts[imagePosition] : '',
    textContent: isSideImage ? `lg:flex-1 ${designClasses.spacing.normal}` : `w-full ${designClasses.spacing.normal}`,
    imageWrapper: imageSizeClass,
    image: isIcon ? 'w-full h-full object-contain' : 'w-full h-auto rounded-[0.65rem]',
  };
}

export function getButtonClasses(buttonStyle = 'primary', buttonSize = 'md') {
  const baseClass = designClasses.buttons.base;
  const sizeClass = designClasses.buttons.sizes[buttonSize] || designClasses.buttons.sizes.md;
  const styleClass = designClasses.buttons.styles[buttonStyle] || designClasses.buttons.styles.primary;
  
  return `${baseClass} ${sizeClass} ${styleClass}`;
}

export function getFormClasses(alignment = 'center', theme = 'light') {
  const textColors = designClasses.textColors[theme];
  const base = getBaseBlockClasses(alignment, theme);
  
  const wrapperAlignment = {
    left: '',
    center: 'flex justify-center',
    right: 'flex justify-right',
  }

  return {
    wrapper: wrapperAlignment['center'],
    form: 'w-full max-w-md flex flex-col gap-2',
    label: 'block text-lg text-left',
    placeholder: 'text-md',
    textfield: 'px-1 w-full border-1 border-dark-blue-1/30 rounded bg-light-blue-1/40',

    textarea: 'w-full px-2 py-2 border border-gray-300 rounded-lg resize-y min-h-[120px]',
    select: 'w-full px-4 py-2 mb-2 text-sm border border-gray-300 rounded-lg',
    
    fieldset: 'border border-gray-300 rounded-lg p-4 mb-4',
    legend: 'text-sm font-medium px-2',
    
    checkboxLabel: 'flex items-center gap-1 cursor-pointer',
    checkbox: 'w-4 h-4',
    checkboxGroup: 'space-y-2',
    
    radioLabel: 'flex items-center gap-2 cursor-pointer',
    radio: 'w-4 h-4',
    radioGroup: 'space-y-2',
    button: 'mt-4',
  }

}

export function getFooterClasses() {
  return designClasses.footer;
}

export function getFaqClasses(alignment='left', theme = 'light') {
  const base = getBaseBlockClasses(alignment, theme);

  const textColors = designClasses.textColors[theme];
  
  return {
    ...base,
    faqContainer: designClasses.faq.container,
    item: designClasses.faq.item,
    itemOpen: designClasses.faq.itemOpen,
    itemClosed: designClasses.faq.itemClosed,
    question: designClasses.faq.question,
    questionText: `${designClasses.faq.questionText} ${textColors.heading}`,
    questionIcon: designClasses.faq.questionIcon,
    questionIconOpen: designClasses.faq.questionIconOpen,
    answer: `${designClasses.faq.answer} ${textColors.body}`,
    answerWrapper: designClasses.faq.answerWrapper
  };
}

export function getSinglePageClasses(theme = 'light', alignmen = 'left') {
  const textColors = designClasses.textColors[theme];

  return {
    pageContainer: `container-standard py-4`,
    containerHero: `flex flex-col gap-4`,
    image: `w-full max-h-96 object-contain object-left rounded-md`,
    heading: `${designClasses.typography.h2} ${textColors.heading}`,



    containerMeta: `p-4 border-1 rounded-md`,
    metaText: `${designClasses.typography.bodyLarge} ${textColors.bodyLarge}`,

    containerContent: `flex flex-col gap-6 mb-8`,
    description: `${designClasses.typography.bodyDescription} ${textColors.bodyDescription}`,
    content: `${designClasses.typography.body} ${textColors.body}`,

  }
}


/**
 * Generate responsive grid classes
 */
export function getResponsiveGridClasses(desktop = 3, tablet = 2, mobile = 1, useItemsStart = false) {
  // ✅ Explicit mapping - Tailwind sees all classes at build time
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };
  
  const tabletColClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  };
  
  const desktopColClasses = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  };
  
  const mobileClass = colClasses[mobile] || colClasses[1];
  const tabletClass = tabletColClasses[tablet] || tabletColClasses[2];
  const desktopClass = desktopColClasses[desktop] || desktopColClasses[3];
  
  const alignment = useItemsStart ? 'items-start' : 'items-stretch';
  
  return `grid gap-10 ${alignment} ${mobileClass} ${tabletClass} ${desktopClass}`;
}

export const INDEPENDENT_HEIGHT_COLLECTIONS = [
  'jobs'
]


/* 
Override example
const base = getBaseBlockClasses('left', theme, {
    headline: `text-4xl lg:text-6xl font-bold leading-tight mb-6 ${textColors.heading}`
  }); */