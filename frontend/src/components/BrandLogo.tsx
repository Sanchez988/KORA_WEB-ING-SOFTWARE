interface BrandLogoProps {
  variant?: 'stacked' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
}

const sizeMap = {
  sm: {
    wrapper: 'gap-2',
    icon: 'w-10 h-10',
    title: 'text-2xl',
    subtitle: 'text-xs',
    inlineGap: 'gap-2',
  },
  md: {
    wrapper: 'gap-3',
    icon: 'w-14 h-14',
    title: 'text-4xl',
    subtitle: 'text-sm',
    inlineGap: 'gap-3',
  },
  lg: {
    wrapper: 'gap-4',
    icon: 'w-16 h-16',
    title: 'text-5xl',
    subtitle: 'text-base',
    inlineGap: 'gap-4',
  },
} as const;

export default function BrandLogo({
  variant = 'stacked',
  size = 'md',
  showSubtitle = true,
  subtitle = 'Brav Crew',
}: BrandLogoProps) {
  const styles = sizeMap[size];

  return (
    <div className={`flex ${variant === 'inline' ? `items-center ${styles.inlineGap}` : `flex-col items-center ${styles.wrapper}`}`}>
      <div className={`${styles.icon} rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary-dark shadow-lg flex items-center justify-center`}>
        <svg viewBox="0 0 64 64" className="w-[72%] h-[72%]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M32 53c-7-4.7-18-11.8-18-22.7C14 23 19 18 25.2 18c3.6 0 6.8 1.7 8.8 4.4 2-2.7 5.2-4.4 8.8-4.4C49 18 54 23 54 30.3 54 41.2 43 48.3 36 53a3.6 3.6 0 0 1-4 0Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M21 39.5h22"
            stroke="#FF6B9D"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className={`${variant === 'inline' ? 'text-left' : 'text-center'} leading-none`}>
        <h1 className={`${styles.title} font-heading font-extrabold tracking-tight`}>
          <span className="text-gray-900 dark:text-white">Ko</span>
          <span className="text-primary">ra</span>
        </h1>
        {showSubtitle && (
          <p className={`${styles.subtitle} mt-1 font-medium text-gray-600 dark:text-gray-400 tracking-wide`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
