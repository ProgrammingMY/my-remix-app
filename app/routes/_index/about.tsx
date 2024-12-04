export default function About() {
    return (
        <section
            id="about"
            className="container mx-auto py-24 sm:py-32 px-4"
        >
            <div className="bg-muted/50 border rounded-lg py-12">
                <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
                    {/* <img
                src={pilot}
                alt=""
                className="w-[300px] object-contain rounded-lg"
              /> */}
                    <div className="bg-green-0 flex flex-col justify-between">
                        <div className="pb-6">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                About{" "}
                                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                                    Developer
                                </span>
                            </h2>
                            <p className="text-xl text-muted-foreground mt-4">
                                My name is Hakim, I am a software developer with
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
