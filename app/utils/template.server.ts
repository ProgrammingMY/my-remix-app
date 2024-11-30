// include app logo in the email from public folder

export const verifyEmailTemplate = (code: string, logo: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 2px;
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            background-color: #f3f4f6;
            border-radius: 4px;
          }
          .expires {
            color: #666;
            font-size: 14px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${logo}" alt="Kelas Tech Logo" style="display: block; margin: 0 auto; height: auto; margin-bottom: 20px;">
          <h1 style="text-align: center; color: #1f2937; margin-bottom: 30px;">Verification Code</h1>
          <p>Please use the following code to verify your email address:</p>
          <div class="code">${code}</div>
          <p class="expires">This code will expire in 10 minutes.</p>
          <p style="margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      </body>
    </html>
  `;
  return html;
};
