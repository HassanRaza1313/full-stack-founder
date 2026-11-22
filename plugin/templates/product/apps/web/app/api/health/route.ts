export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });
}
