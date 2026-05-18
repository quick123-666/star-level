import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubRepo = {
  id: number;
  full_name: string;
};

type RecognizeResult = {
  status: string;
  reason?: string;
  xp_awarded?: number;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ ok: false, message: "Missing authorization" }, 401);
    }

    const { provider_token } = await req.json().catch(() => ({}));
    if (!provider_token || typeof provider_token !== "string") {
      return json({ ok: false, message: "Missing provider_token" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ ok: false, message: "Unauthorized" }, 401);
    }

    const ghUserRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${provider_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "star-level-app",
      },
    });

    if (!ghUserRes.ok) {
      return json(
        {
          ok: false,
          message: `GitHub API error: ${ghUserRes.status}`,
        },
        502,
      );
    }

    const ghUser = (await ghUserRes.json()) as GitHubUser;

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { error: linkError } = await admin.from("github_accounts").upsert(
      {
        user_id: user.id,
        github_user_id: ghUser.id,
        github_login: ghUser.login,
        github_avatar_url: ghUser.avatar_url,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (linkError) {
      return json({ ok: false, message: linkError.message }, 500);
    }

    let recognized = 0;
    let skipped = 0;
    let errors = 0;
    let dailyCapReached = false;
    let page = 1;
    const perPage = 100;

    while (true) {
      const starsRes = await fetch(
        `https://api.github.com/user/starred?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${provider_token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "star-level-app",
          },
        },
      );

      if (!starsRes.ok) {
        return json(
          {
            ok: false,
            message: `GitHub stars API error: ${starsRes.status}`,
            recognized,
            skipped,
          },
          502,
        );
      }

      const repos = (await starsRes.json()) as GitHubRepo[];
      if (repos.length === 0) break;

      for (const repo of repos) {
        const { data, error } = await admin.rpc("recognize_github_star", {
          p_user_id: user.id,
          p_repo_id: repo.id,
          p_repo_full_name: repo.full_name,
        });

        if (error) {
          errors += 1;
          continue;
        }

        const result = data as RecognizeResult;
        if (result.status === "recognized") {
          recognized += 1;
        } else {
          skipped += 1;
          if (result.reason === "daily_cap_reached") {
            dailyCapReached = true;
            break;
          }
        }
      }

      if (dailyCapReached) break;
      if (repos.length < perPage) break;
      page += 1;
    }

    await admin
      .from("github_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return json({
      ok: true,
      recognized,
      skipped,
      errors,
      github_login: ghUser.login,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return json({ ok: false, message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
