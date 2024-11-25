import { Link } from '@remix-run/react'

export default function Privacy() {
    return (
        <div className='relative flex flex-col gap-y-4 p-6 max-w-4xl mx-auto'>
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
            <h1 className='text-3xl font-bold'>Privacy Policy</h1>
            <h2 className='text-xl'>1. Introduction</h2>
            <p>
                This Privacy Policy describes how Hakim Technologies Services ("we", "us", "our") uses Google OAuth authentication in the Kelas Tech application to manage user access and personal information.
            </p>
            <h2 className='text-xl'>2. Information We Collect</h2>
            <p>
                Through Google OAuth, we collect the following user information:
            </p>
            <ul className='list-disc list-inside'>
                <li>Username</li>
                <li>Email address</li>
                <li>Google ID</li>
                <li>Google Image</li>
            </ul>
            <h2 className='text-xl'>3. How We Use Your Information</h2>
            <p>
                We use the information you provide to authenticate you and provide access to the Kelas Tech application. We may use your information to:
            </p>
            <ul className='list-disc list-inside'>
                <li>Provide you with a personalized experience</li>
                <li>Creating and managing your account</li>
                <li>Displaying user profile information within the Kelas Tech application</li>
            </ul>
            <h2 className='text-xl'>4. How We Protect Your Information</h2>
            <p>
                We take reasonable measures to protect your information. We use industry-standard security measures to safeguard your information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <h2 className='text-xl'>5. User Rights and Control</h2>
            <h3>5.1 Account Management</h3>
            <ul className='list-disc list-inside'>
                <li>User can delete their account at any time through the Kelas Tech application.</li>
                <li>Upon account deletion, all user data will be permanently deleted and cannot be recovered.</li>
                <li>Complete account deletion will remove all collected OAuth data</li>
            </ul>
            <h2 className='text-xl'>6. Third-Party Sharing</h2>
            <p>
                We do not share user information colledted through Google OAuth with any third-party service providers.
            </p>
            <h2 className='text-xl'>7. Consent and Authorization</h2>
            <p>
                By using Google OAuth, you consent to our use of your information as described in this Privacy Policy.
            </p>
            <h2 className='text-xl'>8. Changes to this Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the Kelas Tech application, and you are advised to review this page periodically for any changes. Your continued use of the Kelas Tech application after any changes to this Privacy Policy will constitute your acceptance of such changes.
            </p>
            <p>This Privacy Policy was last updated on November 21, 2024.</p>
            <h2 className='text-xl'>9. Contact Us</h2>
            <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at <a className='text-blue-600 underline' href="mailto:info@kelastech.com">info@kelastech.com</a>.
            </p>
        </div>
    )
}
