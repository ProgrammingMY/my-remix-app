import crypto from "node:crypto";

export const generateUploadSignature = (
  libraryId: string,
  apiKey: string,
  expirationTime: number,
  videoId: string
): string => {
  const signatureInput = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  return crypto.createHash("sha256").update(signatureInput).digest("hex");
};

export const deleteVideo = async (
  videoId: string,
  libraryId: number,
  env: Env
) => {
  const options = {
    method: "DELETE",
    headers: {
      accept: "application/json",
      AccessKey: env.BUNNY_API_KEY,
    },
  };

  const res = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    options
  );
  if (res.status !== 200) {
    throw new Error("Failed to delete video");
  }
  return res.json();
};
