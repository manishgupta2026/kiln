import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  let cfEnvKeys: string[] = [];
  let cfError: string | null = null;
  let hasCfDbUrl = false;
  let dbUrlPrefix = "";

  try {
    const cf = getCloudflareContext();
    const env = cf?.env as any;
    if (env) {
      cfEnvKeys = Object.keys(env);
      hasCfDbUrl = !!env.DATABASE_URL;
      if (env.DATABASE_URL) {
        dbUrlPrefix = String(env.DATABASE_URL).substring(0, 15) + "...";
      }
    }
  } catch (err: any) {
    cfError = err.message || String(err);
  }

  const processEnvKeys = typeof process !== "undefined" && process.env ? Object.keys(process.env) : [];
  const hasProcessDbUrl = typeof process !== "undefined" && !!process.env?.DATABASE_URL;

  return NextResponse.json({
    hasProcessDbUrl,
    hasCfDbUrl,
    dbUrlPrefix,
    cfEnvKeys,
    cfError,
    processEnvKeysCount: processEnvKeys.length,
    nodeEnv: process.env?.NODE_ENV,
  });
}
