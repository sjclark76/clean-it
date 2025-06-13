// app/page.tsx
// Make sure you have Tailwind CSS configured in your project.

// For Next.js App Router, metadata is exported like this:
export const metadata = {
  title: "Jessiah's Car Cleaning - Premium Detailing Services",
  description:
      "Get your car sparkling clean with Jessiah's professional car cleaning and detailing services. Book your appointment today!",
};

// Placeholder icons (for a real project, consider using an icon library like lucide-react or heroicons)
const SparkleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        aria-hidden="true"
    >
      <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z"
      />
    </svg>
);

const CarWashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        aria-hidden="true"
    >
      <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m0-6V8.25c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v4.5m16.5 0H12m0 0V8.25m0 3.75M3.375 12H12m0 0V8.25"
      />
    </svg>
);

const CheckCircleIcon = ({
                           className = "w-6 h-6",
                         }: {
  className?: string;
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
        aria-hidden="true"
    >
      <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
);

export default function HomePage() {
  return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col font-sans">
        {/* Header/Navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <a
                href="#"
                className="text-2xl font-bold text-purple-600 hover:text-purple-500 transition-colors duration-300 flex items-center"
            >
              <SparkleIcon className="w-7 h-7 mr-2" />
              Jessiah's Car Cleaning
            </a>
            <div className="space-x-2 sm:space-x-4">
              <a
                  href="#services"
                  className="px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                Services
              </a>
              <a
                  href="#about"
                  className="px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                  href="/booking" // Updated to link to booking page
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Book Now
              </a>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative py-24 md:py-36 text-center overflow-hidden bg-gray-50">
            {/* Optional: Add a subtle background image of a car or cleaning pattern */}
            {/* <img src="/path-to-your-hero-background.jpg" alt="Clean car background" className="absolute inset-0 w-full h-full object-cover opacity-10"/> */}
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <CarWashIcon className="w-16 h-16 text-purple-500 mx-auto mb-6" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900">
                <span className="block">Jessiah's Premium</span>
                <span className="block text-purple-600">Car Care Services</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">
                Experience the ultimate clean. We meticulously restore your car's
                shine, inside and out!
              </p>
              <a
                  href="/booking" // Updated to link to booking page
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-600/50"
              >
                Schedule Your Detail
              </a>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-purple-600">
                Our Detailing Services
              </h2>
              <p className="text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto text-lg">
                We offer a range of detailing packages using only high-quality
                products for a lasting, brilliant shine.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Exterior Wash & Wax",
                    description:
                        "Hand wash, clay bar, premium wax for brilliant shine & protection.",
                    icon: <SparkleIcon className="w-10 h-10 text-purple-500 mb-4" />,
                  },
                  {
                    title: "Interior Deep Clean",
                    description:
                        "Vacuum, steam clean, leather conditioning, odor elimination for a fresh interior.",
                    icon: <CarWashIcon className="w-10 h-10 text-purple-500 mb-4" />,
                  },
                  {
                    title: "Full Detail Package",
                    description:
                        "The ultimate treatment! Combines exterior and interior services for a showroom finish.",
                    icon: (
                        <CheckCircleIcon className="w-10 h-10 text-purple-500 mb-4" />
                    ),
                  },
                ].map((service) => (
                    <div
                        key={service.title}
                        className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center"
                    >
                      {service.icon}
                      <h3 className="text-2xl font-semibold mb-3 mt-2 text-gray-800">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* About Jessiah Section */}
          <section id="about" className="py-16 md:py-24 bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                {/* Replace with an actual image of Jessiah or his work */}
                <img
                    src="https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Jessiah's+Quality+Work" // Example: purple blue background for placeholder
                    alt="Jessiah's Car Cleaning"
                    className="rounded-lg shadow-2xl aspect-video object-cover"
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-purple-600">
                  Meet Jessiah
                </h2>
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                  Hi, I'm Jessiah! Cars are my passion, and so is making them
                  look their absolute best. I started this business to bring
                  top-quality, meticulous car cleaning services to our community.
                </p>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  I believe in attention to detail, using the best products, and
                  ensuring every customer drives away happy with a car that feels
                  brand new. Your satisfaction is my priority!
                </p>
                <ul className="space-y-3 text-gray-700 text-lg">
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />{" "}
                    Passionate & Meticulous
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />{" "}
                    Premium Quality Products
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />{" "}
                    Customer Satisfaction Guaranteed
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action / Contact Section */}
          <section
              id="contact"
              className="py-16 md:py-24 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white"
          >
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready for a Spotless Car?
              </h2>
              <p className="text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                Let Jessiah take care of your car. Book an appointment today and
                experience the difference!
              </p>
              <div className="mb-8 space-y-2">
                <p className="text-2xl font-semibold">
                  Call or Text: (555) JCS-CLEAN
                </p>{" "}
                {/* Example: (555) 527-2532 */}
                <p className="text-lg">
                  Email:{" "}
                  <a
                      href="mailto:jessiahscleaning@example.com"
                      className="hover:underline"
                  >
                    jessiahscleaning@example.com
                  </a>
                </p>
              </div>
              <a
                  href="/booking" // Updated to link to booking page
                  className="bg-gray-100 hover:bg-gray-200 text-purple-700 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book Your Appointment
              </a>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-200 text-center py-10">
          <div className="container mx-auto px-4 sm:px-6">
            <p className="text-gray-600 mb-2">
              &copy; {new Date().getFullYear()} Jessiah's Car Cleaning. All Rights
              Reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Proudly serving the [Your Town/Area] community.
            </p>
          </div>
        </footer>
      </div>
  );
}