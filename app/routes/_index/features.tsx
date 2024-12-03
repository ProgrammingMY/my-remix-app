
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import image from "/logo.png";
import image3 from "/logo.png";
import image4 from "/logo.png";
interface FeatureProps {
    title: string;
    description: string;
    image: string;
}

const features: FeatureProps[] = [
    {
        title: "Malaysian Teachers",
        description:
            "Learn from fellow Malaysians who've walked your path. Our teachers speak Malay and English, understand local industry nuances, and share cultural context that makes learning more relatable.",
        image: image4,
    },
    {
        title: "Real World Training",
        description:
            "Our teachers share practical, hands-on knowledge that directly mirrors the challenges and solutions you'll face in local tech companies. Gain skills that matter in today's Malaysian IT landscape.",
        image: image3,
    },
    {
        title: "AI Assistance (Coming Soon)",
        description:
            "Let our intelligent AI system analyze your strengths, passions, and background to chart your ideal tech career path. Receive personalized skill recommendations and custom learning roadmaps.",
        image: image,
    },
];


export default function Features() {
    return (
        <section
            id="features"
            className="container mx-auto py-24 sm:py-32 space-y-8 px-4"
        >
            <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
                Why choose{" "}
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    Our Platform?
                </span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(({ title, description, image }: FeatureProps) => (
                    <Card key={title}>
                        <CardHeader>
                            <CardTitle>{title}</CardTitle>
                        </CardHeader>

                        <CardContent>{description}</CardContent>

                        {/* <CardFooter>
                            <img
                                src={image}
                                alt="About feature"
                                className="w-[200px] lg:w-[300px] mx-auto"
                            />
                        </CardFooter> */}
                    </Card>
                ))}
            </div>
        </section>
    );

}
