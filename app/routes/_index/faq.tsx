import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";

interface FAQProps {
    question: string;
    answer: string;
    value: string;
}

const FAQList: FAQProps[] = [
    {
        question: "Do I need any specific qualifications to start learning?",
        answer: "Not at all! We have a wide range of courses for all levels of experience. Our courses are designed to help you develop your skills and prepare you for a career in the tech industry.",
        value: "item-1",
    },
    {
        question: "How are your courses different from other online platforms?",
        answer:
            "Our courses are uniquely Malaysian-focused, featuring real-world projects from local tech companies. You'll learn from Malaysian industry experts who understand the local tech ecosystem and can provide relevant, practical insights.",
        value: "item-2",
    },
    {
        question:
            "Are the courses conducted in English or Bahasa Malaysia?",
        answer:
            "Most courses are conducted in English with Bahasa Malaysia explanations where needed. Our teachers can switch between both languages to ensure clear understanding.",
        value: "item-3",
    },
    {
        question: "Who are your teachers?",
        answer: "Our teachers are experienced Malaysian IT professionals currently working in the industry. They bring real-world expertise and current industry practices to their teaching.",
        value: "item-4",
    },
    {
        question:
            "Do you offer any free courses?",
        answer:
            "Yes! We offer selected introductory courses for free to help you get started and experience our platform.",
        value: "item-5",
    },
];


export default function FAQs() {
    return (
        <section
            id="faq"
            className="container mx-auto py-24 sm:py-32"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked{" "}
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    Questions
                </span>
            </h2>

            <Accordion
                type="single"
                collapsible
                className="w-full AccordionRoot"
            >
                {FAQList.map(({ question, answer, value }: FAQProps) => (
                    <AccordionItem
                        key={value}
                        value={value}
                    >
                        <AccordionTrigger className="text-left">
                            {question}
                        </AccordionTrigger>

                        <AccordionContent>{answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <h3 className="font-medium mt-4">
                Still have questions?{" "}
                Contact us at <a className='text-blue-600 underline' href="mailto:info@kelastech.com">info@kelastech.com</a>.
            </h3>
        </section>
    );
}
