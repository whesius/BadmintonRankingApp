import type { ClassificationResult } from "../types/index.ts";

const disciplineLabels = { singles: "Singles", doubles: "Doubles", mixed: "Mixed" };

export function StatusCard({ result }: { result: ClassificationResult }) {
  const label = disciplineLabels[result.discipline];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        {result.isInactive && (
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            Inactive
          </span>
        )}
        {result.action === "promote" && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Promote!
          </span>
        )}
        {result.action === "demote" && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Demote
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Rising average */}
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Rising avg</span>
            <span className="font-mono font-medium">{result.risingAverage.toFixed(1)}</span>
          </div>
          {result.riseThreshold !== null && (
            <>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.progressToPromotion >= 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, result.progressToPromotion)}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{result.progressToPromotion.toFixed(0)}% to promotion</span>
                <span>Need: {result.riseThreshold}</span>
              </div>
            </>
          )}
        </div>

        {/* Falling average */}
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Falling avg</span>
            <span className="font-mono font-medium">{result.fallingAverage.toFixed(1)}</span>
          </div>
          {result.fallThreshold !== null && (
            <div className="text-xs">
              {result.safeFromDemotion ? (
                <span className="text-green-600">Safe (floor: {result.fallThreshold})</span>
              ) : (
                <span className="text-red-600">At risk! (floor: {result.fallThreshold})</span>
              )}
            </div>
          )}
        </div>

        {/* Match count */}
        <div className="flex justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
          <span>Valid: {result.validMatchesRising} (rise) / {result.validMatchesFalling} (fall)</span>
          <span>Total: {result.totalMatches}/20</span>
        </div>
      </div>
    </div>
  );
}
