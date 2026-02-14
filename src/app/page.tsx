import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Social Auth Demo</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            {session.user.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {session.user.name || "User"}!
              </h2>
              <p className="text-gray-600">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Session Info</h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="text-sm text-gray-900 font-mono mt-1">
                  {session.user.id}
                </dd>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 mt-1">{session.user.email}</dd>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {session.user.name || "Not provided"}
                </dd>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <dt className="text-sm font-medium text-gray-500">Token Version</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {session.user.tokenVersion}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Authentication Successful
          </h3>
          <p className="text-gray-600">
            You have successfully authenticated using social login. This page is only
            visible to authenticated users.
          </p>
        </div>
      </main>
    </div>
  );
}
