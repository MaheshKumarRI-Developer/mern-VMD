import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const filters = ['All', 'High', 'Low']
const sortOptions = ['Latest', 'Severity']

function App() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortOption, setSortOption] = useState('Latest')

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get('https://mern-vmd.onrender.com/api/data')
      setData(response.data || [])
    } catch (err) {
      setError('Unable to load vulnerability data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 10000)
    return () => clearInterval(intervalId)
  }, [])

  const counts = useMemo(() => {
    const high = data.filter((item) => item.severity === 'High').length
    const low = data.filter((item) => item.severity === 'Low').length
    return {
      total: data.length,
      high,
      low,
    }
  }, [data])

  const chartData = useMemo(
    () => [
      { name: 'High', value: counts.high, fill: '#ef4444' },
      { name: 'Low', value: counts.low, fill: '#22c55e' },
    ],
    [counts.high, counts.low]
  )

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return data
      .filter((item) => {
        if (filter === 'High') return item.severity === 'High'
        if (filter === 'Low') return item.severity === 'Low'
        return true
      })
      .filter((item) => {
        if (!normalizedSearch) return true
        return (
          item.server.toLowerCase().includes(normalizedSearch) ||
          item.code.toLowerCase().includes(normalizedSearch) ||
          item.issue.toLowerCase().includes(normalizedSearch) ||
          item.severity.toLowerCase().includes(normalizedSearch)
        )
      })
      .sort((a, b) => {
        if (sortOption === 'Severity') {
          const severityOrder = { High: 1, Low: 2 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        }
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }, [data, filter, searchTerm, sortOption])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
              Security Operations
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Vulnerability Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Continuous visibility into vulnerability severity and response.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Auto-refresh every 10 seconds
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total vulnerabilities</p>
                <p className="mt-3 text-4xl font-semibold text-slate-900">{counts.total}</p>
              </div>
              <div className="rounded-3xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
                <p className="text-sm text-rose-700">High severity</p>
                <p className="mt-3 text-4xl font-semibold text-rose-800">{counts.high}</p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
                <p className="text-sm text-emerald-700">Low severity</p>
                <p className="mt-3 text-4xl font-semibold text-emerald-800">{counts.low}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  {filters.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-150 ${
                        option === filter
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search issues, servers, codes..."
                    aria-label="Search vulnerabilities"
                    className="w-full min-w-[180px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:max-w-xs"
                  />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full min-w-[160px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-auto"
                  >
                    {sortOptions.map((option) => (
                      <option key={option} value={option}>
                        Sort by {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-600">Loading...</div>
              ) : error ? (
                <div className="rounded-3xl bg-rose-50 p-8 text-center text-rose-700">{error}</div>
              ) : null}
            </div>

            {!loading && !error && (
              <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Server
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Code
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Issue
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Severity
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
                            No vulnerabilities match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item, index) => (
                          <tr key={`${item.server}-${item.timestamp}-${index}`}>
                            <td className="px-6 py-4 text-sm text-slate-900">{item.server}</td>
                            <td className="px-6 py-4 text-sm text-slate-900">{item.code}</td>
                            <td className="px-6 py-4 text-sm text-slate-900">{item.issue}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  item.severity === 'High'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {item.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Severity distribution
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Current risk profile</h2>
              <p className="mt-2 text-sm text-slate-500">
                Visual summary of high versus low issue counts.
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Count']}
                    wrapperStyle={{ fontSize: '0.9rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">High severity</p>
                <p className="mt-3 text-3xl font-semibold text-rose-700">{counts.high}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Low severity</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-700">{counts.low}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
