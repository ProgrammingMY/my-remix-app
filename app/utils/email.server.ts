import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export async function sendEmail({
  to,
  subject,
  html,
  text,
  env,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  env: Env;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`🚧 Development Mode Email:`);
    console.log(`From: ${env.APP_NAME} <${env.AWS_SES_FROM_EMAIL}>`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    return;
  }

  // Add validation for AWS credentials
  if (
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_REGION ||
    !env.AWS_SES_FROM_EMAIL
  ) {
    console.error("Missing AWS credentials:", {
      hasAccessKey: !!env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!env.AWS_SECRET_ACCESS_KEY,
      hasRegion: !!env.AWS_REGION,
      hasFromEmail: !!env.AWS_SES_FROM_EMAIL,
    });
    throw new Error("Missing AWS credentials");
  }
  const sesClient = new SESClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Source: `${env.APP_NAME} <${env.AWS_SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: text,
          Charset: "UTF-8",
        },
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
