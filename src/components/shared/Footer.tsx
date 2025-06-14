// src/components/shared/Footer.tsx
interface FooterProps {
  secondaryText?: string;
}

export default function Footer({ secondaryText }: FooterProps) {
  const year = new Date().getFullYear();
  const defaultCopyright = `© ${year} Jessiah's Car Spa. All Rights Reserved.`;

  return (
    <footer className='bg-gray-200 text-center py-10'>
      {/* Standardized padding */}
      <div className='container mx-auto px-4 sm:px-6'>
        <p className='text-gray-600 mb-2'>{defaultCopyright}</p>
        {secondaryText && (
          <p className='text-gray-500 text-sm'>{secondaryText}</p>
        )}
      </div>
    </footer>
  );
}
