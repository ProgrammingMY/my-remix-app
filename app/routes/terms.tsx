import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function Terms() {
    return (
        <div className='flex flex-col gap-y-4 p-6 max-w-4xl mx-auto'>
            <Link
                to="/"
                className="py-2 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{" "}
                Back
            </Link>
            <h1 className='text-3xl font-bold'>Kelas Tech - Terms of Service</h1>
            <h2 className='text-xl'>1. Acceptance of Terms</h2>
            <p>
                By accessing or using the Kelas Tech platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
            <h2 className='text-xl'>2. Description of Service</h2>
            <p>
                Kelas Tech is an online Learning Management System that provides:
            </p>
            <ul className='list-disc list-inside'>
                <li>Course marketplace for students to view and purchase courses</li>
                <li>Platform for teachers to create and sell educational content</li>
                <li>Educational resources and learning tools</li>
            </ul>
            <h2 className='text-xl'>3. User Eligibility</h2>
            <ul className='list-disc list-inside'>
                <li>Minimum age requirement: 8 years old</li>
                <li>Users under 18 must have parental or guardian consent</li>
                <li>Each user may only maintain one active account</li>
            </ul>

            <h2 className='text-xl'>4. User Accounts</h2>
            <h3 className="text-lg">4.1 Account Creation</h3>
            <ul className='list-disc list-inside'>
                <li>Users must provide accurate and current information</li>
                <li>Users are responsible for maintaining the confidentiality of their account</li>
                <li>Users are responsible for all activities under their account</li>
            </ul>
            <h3 className="text-lg">4.2 Account Types</h3>
            <ul className='list-disc list-inside'>
                <li>Student accounts: Can purchase and view courses</li>
                <li>Teacher accounts: Can create and sell educational content</li>
            </ul>

            <h2 className='text-xl'>5. Content Guidelines</h2>
            <h3 className="text-lg">5.1 Permitted Content</h3>
            <ul className='list-disc list-inside'>
                <li>Educational videos, text, and attachments directly related to courses</li>
                <li>Content must be appropriate for educational purposes</li>
            </ul>
            <h3 className="text-lg">5.2 Prohibited Content</h3>
            <p>Strictly prohibited content includes:</p>
            <ul className='list-disc list-inside'>
                <li>Pornographic material</li>
                <li>Entertainment content unrelated to education</li>
                <li>Offensive, harmful, or inappropriate materials</li>
                <li>Content that violates intellectual property rights</li>
            </ul>

            <h2 className='text-xl'>6. Financial Terms</h2>
            <h3>6.1 Course Purchases</h3>
            <ul className='list-disc list-inside'>
                <li>Prices for courses are displayed at the time of purchase</li>
                <li>Purchases are final</li>
                <li>No refund policy is in effect</li>
            </ul>
            <h3>6.2 Teacher Earnings</h3>
            <ul className='list-disc list-inside'>
                <li>Teachers earn a share of profits from their paid courses</li>
                <li>Profit-sharing details will be communicated separately</li>
                <li>Payment terms subject to separate agreement</li>
            </ul>
            <h3>6.3 Future Services</h3>
            <ul className='list-disc list-inside'>
                <li>Subscription model for pro features (including AI services) may be introduced</li>
                <li>Subscription terms will be clearly communicated when launched</li>
            </ul>

            <h2 className='text-xl'>7. Intellectual Property</h2>
            <h3>7.1 Teacher Content</h3>
            <ul className='list-disc list-inside'>
                <li>Teachers retain full ownership of their course content</li>
                <li>Kelas Tech provides a secure platform to prevent unauthorized downloads</li>
                <li>Teachers grant Kelas Tech a license to display and distribute their content on the platform</li>
            </ul>
            <h3>7.2 Platform Ownership</h3>
            <ul className='list-disc list-inside'>
                <li>Kelas Tech owns all rights to the platform's design, software, and unique features</li>
            </ul>

            <h2 className='text-xl'>8. User Conduct</h2>
            <p>
                Users must adhere to the following conduct guidelines:
            </p>
            <ul className='list-disc list-inside'>
                <li>Use the platform for educational purposes only</li>
                <li>Not attempt to circumvent platform security</li>
                <li>Respect other users' rights and privacy</li>
                <li>Not engage in harassment, bullying, or inappropriate behavior</li>
            </ul>

            <h2 className='text-xl'>9. Account Suspension and Termination</h2>
            <h3>9.1 Grounds for Suspension</h3>
            <ul className='list-disc list-inside'>
                <li>Violation of Terms of Service</li>
                <li>Suspicious or fraudulent activity</li>
                <li>Multiple reported violations</li>
            </ul>
            <h3>9.2 Suspension Effects</h3>
            <ul className='list-disc list-inside'>
                <li>Account access may be temporarily or permanently restricted</li>
                <li>Course purchases remain valid and accessible</li>
            </ul>

            <h2 className='text-xl'>10. Limitation of Liability</h2>
            <h3>10.1 No Warranties</h3>
            <ul className='list-disc list-inside'>
                <li>Service is provided "as is" without any warranties</li>
                <li>Kelas Tech does not guarantee:</li>
                <ul className='list-disc list-inside'>
                    <li>Continuous, uninterrupted service</li>
                    <li>Absolute accuracy of course content</li>
                    <li>Specific learning outcomes</li>
                </ul>
            </ul>
            <h3>10.2 Disclaimer</h3>
            <p>Kelas Tech is not responsible for:</p>
            <ul className='list-disc list-inside'>
                <li>Content created by teachers</li>
                <li>Interactions between users</li>
                <li>External links in course materials</li>
            </ul>

            <h2 className='text-xl'>11. Modificaions to Terms of Service</h2>
            <ul className='list-disc list-inside'>
                <li>Kelas Tech reserves the right to modify these terms</li>
                <li>Users will be notified of significant changes</li>
                <li>Continued use of the platform constitutes acceptance of updated terms</li>
            </ul>

            <h2 className='text-xl'>12. Privacy</h2>
            <ul className='list-disc list-inside'>
                <li>User data handling is governed by our separate <a className='text-blue-600 underline' href="/privacy">Privacy Policy</a></li>
                <li>Users consent to data collection and use as outlined in the Privacy Policy</li>
            </ul>

            <p>This Terms of Service was last updated on November 21, 2024.</p>
            <p>
                If you have any questions or concerns about this Terms of Service, please contact us at <a className='text-blue-600 underline' href="mailto:info@kelastech.com">info@kelastech.com</a>.
            </p>
        </div>
    )
}
