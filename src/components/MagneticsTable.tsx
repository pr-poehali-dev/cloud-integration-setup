import { useState, useMemo, useEffect, useRef } from "react"
import { MagneticRecord } from "@/data/magnetics"
import Icon from "@/components/ui/icon"

const API = "https://functions.poehali.dev/12996021-367b-41eb-ae20-cee744cae264"

export default function MagneticsTable() {
  const [search, setSearch] = useState("")
  const [filterEmpty, setFilterEmpty] = useState(false)
  const [data, setData] = useState<MagneticRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Admin
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [password, setPassword] = useState("")
  const [adminToken, setAdminToken] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editManufacture, setEditManufacture] = useState("")
  const [editCoating, setEditCoating] = useState("")
  const [saving, setSaving] = useState(false)

  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  useEffect(() => {
    if (showLoginModal) setTimeout(() => passwordRef.current?.focus(), 50)
  }, [showLoginModal])

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const nameLower = r.name.toLowerCase()
      const tokens = search.toLowerCase().trim().split(/[\s.]+/).filter(Boolean)
      const matchSearch = tokens.length === 0 || tokens.every((token) => nameLower.includes(token))
      const matchEmpty = filterEmpty ? r.manufacture !== null || r.coating !== null : true
      return matchSearch && matchEmpty
    })
  }, [search, filterEmpty, data])

  const fmt = (v: number | null) =>
    v === null ? <span className="text-gray-600">—</span> : v.toFixed(4).replace(".", ",")

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginError("")
    const res = await fetch(`${API}?login=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    const json = await res.json()
    setLoginLoading(false)
    if (json.ok) {
      setIsAdmin(true)
      setAdminToken(password)
      setShowLoginModal(false)
      setPassword("")
    } else {
      setLoginError("Неверный пароль")
    }
  }

  const startEdit = (row: MagneticRecord) => {
    setEditingId(row.id)
    setEditManufacture(row.manufacture !== null ? String(row.manufacture) : "")
    setEditCoating(row.coating !== null ? String(row.coating) : "")
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: number) => {
    setSaving(true)
    const manufacture = editManufacture === "" ? null : parseFloat(editManufacture.replace(",", "."))
    const coating = editCoating === "" ? null : parseFloat(editCoating.replace(",", "."))
    await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": adminToken },
      body: JSON.stringify({ id, manufacture, coating }),
    })
    setData((prev) => prev.map((r) => r.id === id ? { ...r, manufacture, coating } : r))
    setEditingId(null)
    setSaving(false)
  }

  const numInput = (val: string, onChange: (v: string) => void) => (
    <input
      type="text"
      value={val}
      onChange={(e) => onChange(e.target.value)}
      className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white font-mono text-xs text-right focus:outline-none focus:border-blue-500"
      placeholder="—"
    />
  )

  return (
    <div className="w-full">
      {/* Search bar */}
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
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFilterEmpty(!filterEmpty)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${filterEmpty ? "bg-gray-700 border-gray-500 text-white" : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500"}`}
        >
          <Icon name={filterEmpty ? "EyeOff" : "Eye"} size={14} />
          Скрыть пустые
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        {loading ? "Загрузка..." : `Найдено: ${filtered.length} из ${data.length}`}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-4 py-3 text-gray-400 font-mono text-xs w-12">№</th>
              <th className="text-left px-4 py-3 text-gray-400 font-mono text-xs">Обозначение магнитопровода</th>
              <th className="text-right px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">Изготовление (сборка)</th>
              <th className="text-right px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">Покрытие клеем</th>
              {isAdmin && <th className="w-16 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-600">Загрузка...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-600">Ничего не найдено</td></tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? "bg-transparent" : "bg-gray-900/20"}`}>
                  <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-2.5 text-white font-mono text-xs tracking-wide">{row.name}</td>
                  {editingId === row.id ? (
                    <>
                      <td className="px-4 py-2 text-right">{numInput(editManufacture, setEditManufacture)}</td>
                      <td className="px-4 py-2 text-right">{numInput(editCoating, setEditCoating)}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => saveEdit(row.id)} disabled={saving} className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                            <Icon name="Check" size={14} />
                          </button>
                          <button onClick={cancelEdit} className="p-1 text-gray-500 hover:text-gray-300">
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-blue-300">{fmt(row.manufacture)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-300">{fmt(row.coating)}</td>
                      {isAdmin && (
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => startEdit(row)} className="p-1 text-gray-600 hover:text-gray-300 transition-colors">
                            <Icon name="Pencil" size={13} />
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin button bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        {isAdmin ? (
          <button
            onClick={() => setIsAdmin(false)}
            title="Выйти из режима редактирования"
            className="flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800/80 border border-emerald-700 text-emerald-300 text-xs px-3 py-2 rounded-lg backdrop-blur transition-colors"
          >
            <Icon name="ShieldCheck" size={14} />
            Режим редактирования
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            title="Войти как администратор"
            className="bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700 text-gray-500 hover:text-gray-300 p-2.5 rounded-lg backdrop-blur transition-colors"
          >
            <Icon name="Pencil" size={16} />
          </button>
        )}
      </div>

      {/* Login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-white font-mono text-sm mb-4 flex items-center gap-2">
              <Icon name="Lock" size={14} />
              Вход для администратора
            </h3>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError("") }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Введите пароль"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500 mb-3"
            />
            {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="flex-1 bg-white text-black text-sm font-medium py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {loginLoading ? "Проверка..." : "Войти"}
              </button>
              <button
                onClick={() => { setShowLoginModal(false); setPassword(""); setLoginError("") }}
                className="px-4 py-2 border border-gray-700 text-gray-400 text-sm rounded-lg hover:border-gray-500 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}