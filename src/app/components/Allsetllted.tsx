'use client'
import { useRef, useState } from "react"

const AllSettled = () => {
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const controllers = useRef<AbortController[]>([])

    const makeApiCall = async (index: number) => {
        try {
            const controller = new AbortController()
            controllers.current[index] = controller

            const response = await fetch('https://dummyjson.com/products?limit=100', {
                signal: controller.signal
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const data = await response.json()
            return data
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new Error('Request cancelled')
            }
            throw err
        }
    }

    const fetchMultipleApis = async () => {
        setLoading(true)
        setError(null)
        controllers.current = []

        try {
            // Create array of 3 API calls
            const apiCalls = [makeApiCall(0), makeApiCall(1), makeApiCall(2)]
            
            const results = await Promise.allSettled(apiCalls)
            setResults(results)
        } catch (err) {
            setError('Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    const cancelRequest = (index: number) => {
        if (controllers.current[index]) {
            controllers.current[index].abort()
            controllers.current[index] = null
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Multiple API Calls with Individual Cancel</h1>
                
                <div className="space-x-4 mb-6">
                    <button 
                        onClick={fetchMultipleApis}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Fetch Multiple APIs
                    </button>
                    
                    {[0, 1, 2].map((index) => (
                        <button
                            key={index}
                            onClick={() => cancelRequest(index)}
                            disabled={!loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Cancel Request {index + 1}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="text-gray-600">Loading...</div>
                )}

                {error && (
                    <div className="text-red-500">{error}</div>
                )}

                {results.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded">
                        {results.map((result, index) => (
                            <div key={index} className="mb-4">
                                <h3 className="font-bold">Request {index + 1} Status: {result.status}</h3>
                                {result.status === 'fulfilled' && (
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(result.value, null, 2)}
                                    </pre>
                                )}
                                {result.status === 'rejected' && (
                                    <div className="text-red-500">
                                        {result.reason.message}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllSettled
