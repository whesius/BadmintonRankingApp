export function Contact() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Contact</h2>
        <p className="text-sm text-gray-700">
          Questions, suggestions, or found a bug? Reach out at{" "}
          <a href="mailto:walter@zonsoft.be"
            className="text-blue-600 underline hover:text-blue-800">
            walter@zonsoft.be
          </a>
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Technology Stack</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">Frontend</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">React 19</span> — UI framework</li>
              <li><span className="font-medium">TypeScript 5.9</span> — type-safe JavaScript</li>
              <li><span className="font-medium">Tailwind CSS 4</span> — utility-first styling</li>
              <li><span className="font-medium">Recharts</span> — chart library for progress visualizations</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">Build & Development</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">Vite 7</span> — build tool and dev server</li>
              <li><span className="font-medium">ESLint</span> — code linting</li>
              <li><span className="font-medium">Node.js 22</span> — runtime environment</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">Testing</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">Vitest</span> — unit test framework</li>
              <li><span className="font-medium">jsdom</span> — DOM simulation for HTML parser tests</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">Deployment</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">GitHub Pages</span> — static hosting</li>
              <li><span className="font-medium">GitHub Actions</span> — CI/CD pipeline, auto-deploys on push to main</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">Storage</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">localStorage</span> — all data stays in your browser, nothing is sent to a server</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900">AI-Assisted Development</h3>
            <ul className="list-inside list-disc space-y-0.5">
              <li><span className="font-medium">Claude Code</span> — AI pair-programming by Anthropic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
