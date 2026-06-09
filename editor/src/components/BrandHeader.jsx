/**
 * Page header: the Toonleer logo (symbol + wordmark) links back to toonleer.com
 * in a new tab, followed by the editor's own title. Mirrors the main app's brand
 * (toonleer_symbol_v2.svg + Quicksand wordmark).
 */
const logoSrc = `${import.meta.env.BASE_URL}toonleer_symbol_v2.svg`;

export default function BrandHeader() {
  return (
    <header className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-6">
      <a
        href="https://toonleer.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-80 transition-opacity"
        aria-label="Toonleer — opens in a new tab"
      >
        <img src={logoSrc} alt="Toonleer" className="w-8 h-8" />
        <span className="font-sans font-extrabold tracking-tight text-2xl ml-1 text-black">
          Toonleer
        </span>
      </a>
      <span className="text-2xl font-semibold tracking-tight text-gray-700">
        Translations Editor
      </span>
    </header>
  );
}
