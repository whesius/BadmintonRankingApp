export function Help() {
  return (
    <div className="space-y-6">
      {/* Getting Started */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Getting Started</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
          <li>Go to the <strong>Settings</strong> tab and enter your name, member ID, gender, and current classification levels for each discipline (singles, doubles, mixed).</li>
          <li>Switch to the <strong>Matches</strong> tab and start adding your match results.</li>
          <li>The <strong>Dashboard</strong> will automatically calculate your rising and falling averages and show how close you are to promotion or demotion.</li>
          <li>Use the <strong>Simulator</strong> to explore "what if" scenarios before your next tournament or interclub.</li>
        </ol>
      </section>

      {/* How the Ranking System Works */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">How the Belgian Ranking System Works</h2>
        <p className="mb-3 text-sm text-gray-700">
          This app implements the official <strong>C700 regulation (2024 edition)</strong> of the Royal Belgian Badminton Federation (KBBF).
        </p>

        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">12 Classification Levels</h3>
        <p className="text-sm text-gray-700">
          Every player has a separate classification (1 = highest, 12 = lowest) for each discipline: singles, doubles, and mixed. New players start at level 12.
        </p>

        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">Points Per Win</h3>
        <p className="mb-2 text-sm text-gray-700">
          When you win a match, you earn points based solely on your opponent's classification level. A loss always earns 0 points. For doubles/mixed, the points are the average of both opponents' levels.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-1.5 font-medium text-gray-600">Opponent Level</th>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(l => (
                  <th key={l} className="px-2 py-1.5 text-center font-medium text-gray-600">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-1.5 font-medium text-gray-700">Points</td>
                {[2831,1961,1359,942,652,452,313,217,150,104,72,50].map((p, i) => (
                  <td key={i} className="px-2 py-1.5 text-center font-mono text-gray-700">{p}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">Two Averages</h3>
        <p className="text-sm text-gray-700">
          The system calculates two averages per discipline from your matches in the last 52 weeks (max 20 matches):
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          <li><strong>Rising average</strong> (gemiddelde voor stijgen) — determines if you promote. Losses against opponents more than 1 level higher are excluded. Low wins that would lower your average are also excluded.</li>
          <li><strong>Falling average</strong> (gemiddelde voor dalen) — determines if you demote. Only checked when your rising average is below your current level's threshold. Losses against any higher-ranked opponent are excluded.</li>
        </ul>
        <p className="mt-2 text-sm text-gray-700">
          If you have fewer than 7 valid matches, the rising average divides by 7 (penalizing few matches). The falling average divides by the actual count (more lenient).
        </p>

        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">Promotion &amp; Demotion</h3>
        <p className="text-sm text-gray-700">
          Classifications are evaluated on the <strong>first Monday of each month</strong>. You can move at most 1 level per evaluation.
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          <li><strong>Promotion:</strong> Rising average ≥ rise threshold of the next higher level.</li>
          <li><strong>Demotion:</strong> Only if the rising average is below your own level's threshold, AND the falling average ≤ fall threshold of the next lower level.</li>
          <li>After a demotion, you are protected for <strong>26 weeks</strong> against a second consecutive demotion.</li>
        </ul>
      </section>

      {/* Dashboard */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Dashboard Tab</h2>
        <p className="text-sm text-gray-700">
          Shows three status cards (one per discipline) with:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          <li><strong>Rising average</strong> and a progress bar showing how close you are to the promotion threshold.</li>
          <li><strong>Falling average</strong> and whether you are safe from demotion.</li>
          <li>Number of valid matches counted for each average.</li>
          <li>A <strong>progress chart</strong> showing your rising average evolution over time, with promotion and demotion threshold lines.</li>
        </ul>
      </section>

      {/* Matches */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Matches Tab</h2>
        <h3 className="mb-2 text-base font-semibold text-gray-800">Adding a Match</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Select the <strong>date</strong>, <strong>discipline</strong>, <strong>result</strong> (win/loss), and <strong>competition type</strong>.</li>
          <li>For singles: enter the opponent's classification level.</li>
          <li>For doubles/mixed: enter your partner's level and both opponents' levels.</li>
          <li>Check <strong>Walkover</strong> if the match was not actually played — walkovers are excluded from all calculations.</li>
          <li>The points are calculated automatically and shown before you submit.</li>
        </ul>

        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">Which Matches to Enter</h3>
        <p className="text-sm text-gray-700">
          Enter all official matches from tournaments, interclub, and championships played in Belgium under KBBF/LFBB/BV. Youth and senior age category matches are excluded from the ranking system.
        </p>
      </section>

      {/* Simulator */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Simulator Tab</h2>
        <p className="text-sm text-gray-700">
          Plan your path to promotion:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Add hypothetical wins or losses against any opponent level.</li>
          <li>See the <strong>projected rising average</strong> and whether it would trigger promotion.</li>
          <li>The <strong>"Wins Needed to Promote"</strong> section shows exactly how many wins at each opponent level you need to reach promotion.</li>
          <li>Use this before a tournament to know which matches matter most.</li>
        </ul>
      </section>

      {/* Settings & Data */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Settings Tab &amp; Data</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>All data is stored <strong>locally in your browser</strong> (localStorage). Nothing is sent to a server.</li>
          <li>Use <strong>Export JSON</strong> to save a backup of all your data. Use <strong>Import JSON</strong> to restore it on another device or browser.</li>
          <li>If you were recently demoted, set the <strong>last demotion date</strong> so the 26-week protection is correctly calculated.</li>
          <li>Your classification levels should match your official classification on badmintonvlaanderen.be. Update them when they change.</li>
          <li><strong>Reset All Data</strong> permanently deletes everything — use with care.</li>
        </ul>
      </section>

      {/* Tips */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Tips</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Losses against weaker opponents hurt your falling average the most — they are the only losses that count for demotion.</li>
          <li>Losses against much stronger opponents (2+ levels higher) are completely ignored for your rising average. Don't be afraid to play up.</li>
          <li>Low wins (e.g. beating a level 12 when you're level 8) may not help your rising average if they drag it down. The system automatically excludes them.</li>
          <li>You need at least <strong>3 matches</strong> per discipline per 52 weeks to stay active. After 104 weeks of inactivity, you drop 2 levels.</li>
          <li>The maximum gap between your highest and lowest discipline is <strong>2 levels</strong>.</li>
        </ul>
      </section>

      {/* About */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">About</h2>
        <p className="text-sm text-gray-700">
          This calculator implements the <strong>C700 Reglement klassementen en ranking</strong>, version 2024, approved by the KBBF board on 11/07/2024. It also includes the bonus points system introduced in December 2024.
        </p>
        <p className="mt-2 text-sm text-gray-700">
          This is an unofficial tool for personal use. For official rankings, visit{" "}
          <a href="https://www.badmintonvlaanderen.be/ranking/find.aspx?rid=334"
            target="_blank" rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800">
            badmintonvlaanderen.be
          </a>.
        </p>
      </section>
    </div>
  );
}
