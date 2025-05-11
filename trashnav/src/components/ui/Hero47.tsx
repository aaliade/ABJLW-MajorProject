import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";


interface Hero47Props {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

const Hero47 = ({
  heading = "A Cleaner Jamaica with ",
  subheading = " Smart Waste Tracking",
  description = "TrashNav makes it easy for citizens to report, track, and monitor garbage issues in their communities. With real-time maps, reports, and smart alerts - keeping your community clean has never been this simple.",
  buttons = {
    primary: {
      text: "Get Started",
      url: "/api/auth/signin",
    },
    secondary: {
      text: "Read more",
      url: "#",
    },
  },
  image = {
    src: "/heropic.png",
    alt: "Placeholder",
  },
}: Hero47Props) => {
  return (
    <section className="bg-background py-5 lg:py-8">
      <div className="container mx-auto flex flex-col-reverse items-center gap-10 lg:flex-row lg:gap-16">
        {/* Text Section */}
        <div className="flex flex-col gap-6 lg:w-1/2">
          <h2 className="text-5xl font-bold text-foreground md:text-6xl lg:text-7xl">
            {heading}
            <span className="block text-green-700">{subheading}</span>
          </h2>
          <p className="text-base text-muted-foreground md:text-lg lg:text-xl">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild>
              <a href={buttons.primary?.url} className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 transition">
                <ArrowUpRight className="w-5 h-5" />
                <span>{buttons.primary?.text}</span>
              </a>
            </Button>
            <Button asChild variant="link" className="underline">
              <a href={buttons.secondary?.url}>{buttons.secondary?.text}</a>
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative lg:w-1/2">
          <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover"
            />
          </div>
        
        </div>
      </div>
    </section>
  );
};

export { Hero47 };
