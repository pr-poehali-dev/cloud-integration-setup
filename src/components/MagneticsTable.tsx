import { useState, useMemo } from "react"
import { MAGNETICS } from "@/data/magnetics"
import Icon from "@/components/ui/icon"

export default function MagneticsTable() {
  const [search, setSearch] = useState("")
  const [filterEmpty, setFilterEmpty] = useState(false)

  const filtered = useMemo(() => {
    return MAGNETICS.filter((r) => {
      const nameLower = r.name.toLowerCase()
      const tokens = search.toLowerCase().trim().split(/[\s.]+/).filter(Boolean)
      const matchSearch = tokens.every((token) => nameLower.includes(token))
      const matchEmpty = filterEmpty ? r.manufacture !== null || r.coating !== null : true
      return matchSearch && matchEmpty
    })
  }, [search, filterEmpty])

  const fmt = (v: number | null) =>
    v === null ? <span className="text-gray-600">—</span> : v.toFixed(4).replace(".", ",")

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по обозначению..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterEmpty(!filterEmpty)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
            filterEmpty
              ? "bg-gray-700 border-gray-500 text-white"
              : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"
          }`}
        >
          <Icon name={filterEmpty ? "EyeOff" : "Eye"} size={14} />
          Скрыть пустые
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        Найдено: {filtered.length} из {MAGNETICS.length}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-4 py-3 text-gray-400 font-mono text-xs w-12">№</th>
              <th className="text-left px-4 py-3 text-gray-400 font-mono text-xs">Обозначение магнитопровода</th>
              <th className="text-right px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                Изготовление (сборка)
              </th>
              <th className="text-right px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                Покрытие клеем
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-600">
                  Ничего не найдено
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                    i % 2 === 0 ? "bg-transparent" : "bg-gray-900/20"
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-2.5 text-white font-mono text-xs tracking-wide">{row.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-blue-300">{fmt(row.manufacture)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-300">{fmt(row.coating)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}