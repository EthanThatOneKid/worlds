import Image from "next/image";
import Link from "next/link";
import * as authkit from "@workos-inc/authkit-nextjs";
import { WorldsApiSdk } from "@fartlabs/worlds";

export default async function Home() {
  const { user } = await authkit.withAuth();
  const signInUrl = await authkit.getSignInUrl();
  const signUpUrl = await authkit.getSignUpUrl();

  const sdk = new WorldsApiSdk({
    baseUrl: "http://localhost:8000/v1",
    apiKey: "EthanIsAwesome",
  });

  const putResponse = await sdk.setStore(
    "1",
    `<http://example.org/subject> <http://example.org/predicate> "object" .`,
    "application/n-quads",
  );

  console.log({ putResponse });

  const data = await sdk.getStore("1", "application/n-quads");

  console.log({ response: data });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <header>
          {user ? (
            <p>Welcome back, {user?.firstName}!</p>
          ) : (
            <p>
              <Link href={signInUrl}>Sign In</Link>
              <Link href={signUpUrl}>Sign Up</Link>
            </p>
          )}
        </header>

        <section className="w-full">
          <h2 className="text-xl font-bold mb-4">Store Contents</h2>
          <pre className="p-4 bg-gray-100 dark:bg-zinc-800 rounded overflow-auto">
            {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          </pre>
        </section>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
