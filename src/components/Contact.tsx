export function Contact() {
  return (
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
  );
}
