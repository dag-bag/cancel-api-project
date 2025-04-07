'use client'
import { useRef, useState } from "react"

const Main = () => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const abortController = useRef<AbortController | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            
          
            abortController.current = new AbortController
            // Fetch random user data from the public API
            const response = await fetch('https://dummyjson.com/products?limit=100',{
                signal:abortController.current.signal
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const jsonData = await response.json()
            setData(jsonData)
            setLoading(false)
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError('Request cancelled')
            } else {
                setError('Error fetching data')
            }
            setLoading(false)
        }
    }

    const cancelRequest = () => {
        if (abortController.current) {
            abortController.current.abort()
            abortController.current = null
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Random Public API Explorer</h1>
                
                <div className="space-x-4 mb-6">
                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Fetch Random API
                    </button>
                    
                    <button
                        onClick={cancelRequest}
                        disabled={!loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Cancel Request
                    </button>
                </div>

                {loading && (
                    <div className="text-gray-600">Loading...</div>
                )}

                {error && (
                    <div className="text-red-500">{error}</div>
                )}

                {data && (
                    <div className="bg-gray-50 p-4 rounded">
                        <pre className="whitespace-pre-wrap">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Main