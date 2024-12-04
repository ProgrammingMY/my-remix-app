import { Link } from '@remix-run/react';
import React from 'react'

export default function Footer() {
    return (
        <footer id="footer">
            <hr className="w-11/12 mx-auto" />

            <section className="container mx-auto py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8 px-4">
                <div className="col-span-full xl:col-span-2">
                    <a
                        rel="noreferrer noopener"
                        href="/"
                        className="ml-2 "
                    >
                        <img className="h-10 w-auto" src='/logo.png' alt="logo" />
                    </a>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Follow Us</h3>
                    <div>
                        <a
                            rel="noreferrer noopener"
                            href="https://www.tiktok.com/@programmingmy"
                            target='_blank'
                            className="opacity-60 hover:opacity-100"
                        >
                            Tiktok
                        </a>
                    </div>

                    <div>
                        <a
                            rel="noreferrer noopener"
                            href="https://www.youtube.com/@programmingmy"
                            target='_blank'
                            className="opacity-60 hover:opacity-100"
                        >
                            YouTube
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">About</h3>
                    <div>
                        <a
                            rel="noreferrer noopener"
                            href="#features"
                            className="opacity-60 hover:opacity-100"
                        >
                            Features
                        </a>
                    </div>
                    <div>
                        <a
                            rel="noreferrer noopener"
                            href="#about"
                            className="opacity-60 hover:opacity-100"
                        >
                            About developer
                        </a>
                    </div>

                    <div>
                        <a
                            rel="noreferrer noopener"
                            href="#faq"
                            className="opacity-60 hover:opacity-100"
                        >
                            FAQ
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Legal</h3>
                    <div>
                        <Link
                            rel="noreferrer noopener"
                            to="/terms"
                            className="opacity-60 hover:opacity-100"
                        >
                            Terms of Service
                        </Link>
                    </div>

                    <div>
                        <Link
                            rel="noreferrer noopener"
                            to="/privacy"
                            className="opacity-60 hover:opacity-100"
                        >
                            Privacy Policy
                        </Link>
                    </div>

                </div>
            </section>

            <section className="container mx-auto pb-14 text-center">
                <h3>
                    &copy; Kelas Tech made by{" "}
                    Hakim@ProgrammingMY
                </h3>
            </section>
        </footer>
    );
}
