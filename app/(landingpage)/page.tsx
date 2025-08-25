// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { 
//   FileText, 
//   Database, 
//   Search, 
//   Loader, 
//   AlertCircle, 
//   Calendar, 
//   Hash, 
//   Eye, 
//   ArrowRight, 
//   ChevronLeft, 
//   ChevronRight, 
//   X, 
//   Play, 
//   Component,
//   Info,
//   Activity,
//   Shield,
//   BarChart3,
//   Users,
//   Clock,
//   TrendingUp
// } from "lucide-react"
// import { getAllFiles, getFilesWithFilter } from "@/action/addData"

// type FileRecord = {
//   id: string
//   filename: string
//   originalFilename: string
//   createdAt: Date
//   updatedAt: Date
//   totalRecords: number
//   dataRecords: {
//     id: string
//     componentService: string
//     scenarioName: string
//     description: string
//     priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
//     possibilityOfIssues: string
//   }[]
// }

// export default function Page() {
//   const router = useRouter()
//   const [selectedExistingFile, setSelectedExistingFile] = useState<FileRecord | null>(null)
//   const [showDialog, setShowDialog] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [uploadError, setUploadError] = useState<string | null>(null)
  
//   // For existing files table
//   const [existingFiles, setExistingFiles] = useState<FileRecord[]>([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const [isSearching, setIsSearching] = useState(false)
//   const [isInitialLoading, setIsInitialLoading] = useState(true)
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(10)

//   // Responsive items per page
//   useEffect(() => {
//     const updateItemsPerPage = () => {
//       if (window.innerWidth < 768) setItemsPerPage(5) // mobile
//       else if (window.innerWidth < 1024) setItemsPerPage(8) // tablet
//       else setItemsPerPage(10) // desktop
//     }
    
//     updateItemsPerPage()
//     window.addEventListener('resize', updateItemsPerPage)
//     return () => window.removeEventListener('resize', updateItemsPerPage)
//   }, [])

//   // Load existing files on component mount
//   useEffect(() => {
//     loadExistingFiles()
//   }, [])

//   // Search files when search term changes
//   useEffect(() => {
//     if (searchTerm.trim()) {
//       searchFiles(searchTerm)
//     } else {
//       loadExistingFiles()
//     }
//     setCurrentPage(1) // Reset to first page on search
//   }, [searchTerm])

//   const loadExistingFiles = async () => {
//     try {
//       setIsSearching(true)
//       const files = await getAllFiles()
//       setExistingFiles(files)
//     } catch (error) {
//       console.error('Error loading files:', error)
//       setUploadError('Failed to load files. Please refresh the page.')
//     } finally {
//       setIsSearching(false)
//       setIsInitialLoading(false)
//     }
//   }

//   const searchFiles = async (term: string) => {
//     setIsSearching(true)
//     try {
//       const files = await getFilesWithFilter(term)
//       setExistingFiles(files)
//     } catch (error) {
//       console.error('Error searching files:', error)
//     } finally {
//       setIsSearching(false)
//     }
//   }

//   const handleFileSelect = (file: FileRecord) => {
//     setSelectedExistingFile(file)
//     setShowDialog(true)
//     setUploadError(null)
//   }

//   const selectExistingFile = async () => {
//     if (!selectedExistingFile) return

//     setIsLoading(true)
//     try {
//       router.push(`/chos/${selectedExistingFile.id}`)
//     } catch (error) {
//       console.error('Navigation error:', error)
//       setUploadError('Failed to load file. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const closeDialog = () => {
//     setShowDialog(false)
//     setSelectedExistingFile(null)
//     setUploadError(null)
//   }

//   // Clear search
//   const clearSearch = () => {
//     setSearchTerm("")
//   }

//   // Pagination logic
//   const totalPages = Math.ceil(existingFiles.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentFiles = existingFiles.slice(startIndex, endIndex)

//   const goToPage = (page: number) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)))
//   }

//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const formatDateFull = (date: Date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     })
//   }

//   const getPriorityColor = (priority: string) => {
//     switch (priority.toUpperCase()) {
//       case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
//       case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
//       case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200'
//       case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
//       default: return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getDominantPriority = (dataRecords: FileRecord['dataRecords']) => {
//     const counts = dataRecords.reduce((acc, record) => {
//       acc[record.priority] = (acc[record.priority] || 0) + 1
//       return acc
//     }, {} as Record<string, number>)
    
//     const dominant = Object.entries(counts).sort(([,a], [,b]) => b - a)[0]
//     return dominant ? dominant[0] : 'MEDIUM'
//   }

//   const getPriorityStats = (dataRecords: FileRecord['dataRecords']) => {
//     return dataRecords.reduce((acc, record) => {
//       acc[record.priority] = (acc[record.priority] || 0) + 1
//       return acc
//     }, {} as Record<string, number>)
//   }

//   const getUniqueComponents = (dataRecords: FileRecord['dataRecords']) => {
//     return [...new Set(dataRecords.map(record => record.componentService))].length
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* Background elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
//         <div
//           className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
//           style={{ animationDelay: "2s" }}
//         />
//       </div>

//       <div className="relative z-10">
//         <div className="flex flex-col lg:flex-row min-h-screen">
//           {/* Left Sidebar */}
//           <div className="lg:w-80 xl:w-96 bg-white/95 backdrop-blur-xl border-r border-gray-200/70 shadow-2xl">
//             <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
//               {/* Header Section */}
//               <div className="text-center space-y-3 lg:space-y-4">
//                 <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
//                   <Database className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mb-1 lg:mb-2">
//                     Data Library
//                   </h1>
//                   <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
//                     Chaos Engineering Analytics Platform
//                   </p>
//                 </div>
//               </div>

//               {/* Quick Stats */}
//               <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
//                 <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-indigo-200">
//                   <div className="flex lg:flex-row flex-col items-center gap-2 lg:gap-3">
//                     <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
//                       <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
//                     </div>
//                     <div className="text-center lg:text-left">
//                       <div className="text-lg lg:text-2xl font-bold text-indigo-900">{existingFiles.length}</div>
//                       <div className="text-xs text-indigo-600">Total Files</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-purple-200">
//                   <div className="flex lg:flex-row flex-col items-center gap-2 lg:gap-3">
//                     <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
//                       <Hash className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
//                     </div>
//                     <div className="text-center lg:text-left">
//                       <div className="text-lg lg:text-2xl font-bold text-purple-900">
//                         {existingFiles.reduce((sum, file) => sum + file.totalRecords, 0)}
//                       </div>
//                       <div className="text-xs text-purple-600">Total Scenarios</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-green-200">
//                   <div className="flex lg:flex-row flex-col items-center gap-2 lg:gap-3">
//                     <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
//                       <Component className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
//                     </div>
//                     <div className="text-center lg:text-left">
//                       <div className="text-lg lg:text-2xl font-bold text-green-900">
//                         {existingFiles.reduce((total, file) => total + getUniqueComponents(file.dataRecords), 0)}
//                       </div>
//                       <div className="text-xs text-green-600">Components</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* System Status - Hidden on mobile to save space */}
//               <div className="hidden lg:block space-y-3">
//                 <h3 className="text-sm font-semibold text-gray-700">System Status</h3>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                     <Activity className="w-4 h-4 text-blue-500" />
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">Data Status</div>
//                       <div className="text-xs text-green-600 font-medium">All systems operational</div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                     <Shield className="w-4 h-4 text-green-500" />
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">Security</div>
//                       <div className="text-xs text-green-600 font-medium">Protected</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 p-3 lg:p-6">
//             <div className="space-y-4">
//               {/* Error Display */}
//               {uploadError && (
//                 <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
//                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//                   <p className="text-sm text-red-700 flex-1">{uploadError}</p>
//                   <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 transition-colors">
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}

//               {/* Search Section */}
//               <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
//                 <CardHeader className="pb-3">
//                   <div className="flex flex-col gap-3">
//                     <div>
//                       <CardTitle className="flex items-center gap-2 text-slate-800 text-lg lg:text-xl">
//                         <Database className="w-5 h-5 text-indigo-600" />
//                         File Explorer
//                       </CardTitle>
//                       <CardDescription className="text-sm">
//                         Search and manage your chaos engineering data files
//                       </CardDescription>
//                     </div>

//                     {/* Search Bar */}
//                     <div className="flex gap-2">
//                       <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//                         <Input
//                           placeholder="Search files, scenarios, or components..."
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           className="pl-9 pr-9 border-2 border-slate-200 focus:border-blue-500 bg-white/90 h-9 text-sm"
//                         />
//                         {searchTerm && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={clearSearch}
//                             className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
//                           >
//                             <X className="w-3 h-3" />
//                           </Button>
//                         )}
//                         {isSearching && (
//                           <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
//                         )}
//                       </div>
//                     </div>

//                     {/* Search Status */}
//                     {(searchTerm || existingFiles.length > 0) && (
//                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between text-xs lg:text-sm">
//                         <div className="flex flex-wrap items-center gap-2">
//                           {searchTerm && (
//                             <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                               Search: "{searchTerm}"
//                             </Badge>
//                           )}
//                           <span className="text-slate-600">
//                             {existingFiles.length} file{existingFiles.length !== 1 ? 's' : ''} found
//                           </span>
//                         </div>
//                         {searchTerm && (
//                           <Button variant="outline" size="sm" onClick={clearSearch} className="text-xs h-7">
//                             Clear Search
//                           </Button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </CardHeader>

//                 <CardContent className="pt-0">
//                   {isInitialLoading ? (
//                     <div className="flex items-center justify-center py-12">
//                       <div className="flex flex-col items-center gap-4">
//                         <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//                         <span className="text-sm text-slate-500 font-medium">Loading data library...</span>
//                       </div>
//                     </div>
//                   ) : existingFiles.length === 0 ? (
//                     <div className="text-center py-12">
//                       <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
//                         <FileText className="w-8 h-8 text-slate-400" />
//                       </div>
//                       <h3 className="text-lg font-semibold text-slate-700 mb-2">No files found</h3>
//                       <p className="text-slate-500 text-sm mb-4">
//                         {searchTerm 
//                           ? 'Try different search terms or clear the search to see all files' 
//                           : 'Upload your first chaos engineering file to get started'
//                         }
//                       </p>
//                       {searchTerm && (
//                         <Button variant="outline" onClick={clearSearch} size="sm">
//                           Clear Search
//                         </Button>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {/* Compact Table */}
//                       <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-slate-200">
//                         <div className="overflow-x-auto">
//                           <table className="w-full">
//                             <thead className="bg-slate-50/80 sticky top-0 z-10">
//                               <tr>
//                                 <th className="px-3 lg:px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[200px]">
//                                   File Information
//                                 </th>
//                                 <th className="px-3 lg:px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
//                                   Records
//                                 </th>
//                                 <th className="px-3 lg:px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden md:table-cell">
//                                   Components
//                                 </th>
//                                 <th className="px-3 lg:px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
//                                   Priority
//                                 </th>
//                                 <th className="px-3 lg:px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
//                                   Created
//                                 </th>
//                                 <th className="px-3 lg:px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-12">
//                                   Action
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100">
//                               {currentFiles.map((file, index) => {
//                                 const dominantPriority = getDominantPriority(file.dataRecords)
//                                 const uniqueComponents = getUniqueComponents(file.dataRecords)

//                                 return (
//                                   <tr
//                                     key={file.id}
//                                     onClick={() => handleFileSelect(file)}
//                                     className={`cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/70 group ${
//                                       index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
//                                     }`}
//                                   >
//                                     <td className="px-3 lg:px-4 py-3">
//                                       <div className="flex items-center gap-2 lg:gap-3">
//                                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
//                                           <FileText className="w-4 h-4 text-white" />
//                                         </div>
//                                         <div className="min-w-0">
//                                           <div className="text-sm font-semibold text-slate-900 truncate">
//                                             {file.filename}
//                                           </div>
//                                           <div className="text-xs text-slate-600 truncate lg:max-w-none max-w-[150px]">
//                                             {file.originalFilename}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </td>
//                                     <td className="px-3 lg:px-4 py-3 hidden sm:table-cell">
//                                       <div className="flex items-center gap-1">
//                                         <Hash className="w-3 h-3 text-blue-600" />
//                                         <span className="text-sm font-semibold text-slate-800">{file.totalRecords}</span>
//                                       </div>
//                                     </td>
//                                     <td className="px-3 lg:px-4 py-3 hidden md:table-cell">
//                                       <div className="flex items-center gap-1">
//                                         <Component className="w-3 h-3 text-purple-600" />
//                                         <span className="text-sm text-slate-700">{uniqueComponents}</span>
//                                       </div>
//                                     </td>
//                                     <td className="px-3 lg:px-4 py-3">
//                                       <Badge className={`${getPriorityColor(dominantPriority)} border text-xs px-2 py-1`}>
//                                         {dominantPriority}
//                                       </Badge>
//                                     </td>
//                                     <td className="px-3 lg:px-4 py-3 hidden lg:table-cell">
//                                       <div className="text-xs text-slate-600">
//                                         {formatDate(file.createdAt)}
//                                       </div>
//                                     </td>
//                                     <td className="px-3 lg:px-4 py-3 text-center">
//                                       <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 mx-auto" />
//                                     </td>
//                                   </tr>
//                                 )
//                               })}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       {/* Compact Pagination */}
//                       {totalPages > 1 && (
//                         <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
//                           <div className="text-xs text-slate-600 order-2 sm:order-1">
//                             {startIndex + 1}-{Math.min(endIndex, existingFiles.length)} of {existingFiles.length}
//                           </div>
                          
//                           <div className="flex items-center gap-1 order-1 sm:order-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => goToPage(currentPage - 1)}
//                               disabled={currentPage === 1}
//                               className="h-8 px-3 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
//                             >
//                               <ChevronLeft className="w-3 h-3" />
//                               <span className="hidden sm:inline ml-1">Prev</span>
//                             </Button>
                            
//                             <div className="flex items-center gap-1">
//                               {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
//                                 const pageNum = Math.max(1, Math.min(currentPage - 1, totalPages - 2)) + i
//                                 if (pageNum > totalPages) return null
                                
//                                 return (
//                                   <Button
//                                     key={pageNum}
//                                     variant={pageNum === currentPage ? "default" : "outline"}
//                                     size="sm"
//                                     onClick={() => goToPage(pageNum)}
//                                     className={`h-8 w-8 p-0 text-xs ${
//                                       pageNum === currentPage 
//                                         ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600 text-white shadow-lg' 
//                                         : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
//                                     }`}
//                                   >
//                                     {pageNum}
//                                   </Button>
//                                 )
//                               })}
//                             </div>
                            
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => goToPage(currentPage + 1)}
//                               disabled={currentPage === totalPages}
//                               className="h-8 px-3 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
//                             >
//                               <span className="hidden sm:inline mr-1">Next</span>
//                               <ChevronRight className="w-3 h-3" />
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* File Details Dialog */}
//       {showDialog && selectedExistingFile && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-0">
//             {/* Dialog Header */}
//             <div className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 px-6 py-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//                     <FileText className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold">{selectedExistingFile.filename}</h3>
//                     <p className="text-sm text-white/80">{selectedExistingFile.originalFilename}</p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={closeDialog}
//                   className="text-white hover:bg-white/20 rounded-xl"
//                 >
//                   <X className="w-5 h-5" />
//                 </Button>
//               </div>
//             </div>

//             {/* Dialog Content */}
//             <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
//               {/* Quick Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
//                   <Hash className="w-6 h-6 text-blue-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-blue-900">{selectedExistingFile.totalRecords}</div>
//                   <div className="text-xs text-blue-600">Scenarios</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
//                   <Component className="w-6 h-6 text-purple-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-purple-900">{getUniqueComponents(selectedExistingFile.dataRecords)}</div>
//                   <div className="text-xs text-purple-600">Components</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
//                   <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
//                   <div className="text-sm font-bold text-green-900">{formatDateFull(selectedExistingFile.createdAt)}</div>
//                   <div className="text-xs text-green-600">Created</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
//                   <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
//                   <div className="text-sm font-bold text-orange-900">Ready</div>
//                   <div className="text-xs text-orange-600">Status</div>
//                 </div>
//               </div>

//               {/* Priority Distribution */}
//               <div className="space-y-4">
//                 <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                   <BarChart3 className="w-5 h-5 text-indigo-600" />
//                   Priority Distribution
//                 </h4>
//                 <div className="space-y-3">
//                   {Object.entries(getPriorityStats(selectedExistingFile.dataRecords))
//                     .sort(([,a], [,b]) => b - a)
//                     .map(([priority, count]) => {
//                       const percentage = (count / selectedExistingFile.totalRecords * 100).toFixed(1)
//                       return (
//                         <div key={priority} className="flex items-center gap-3">
//                           <Badge className={`${getPriorityColor(priority)} border text-xs min-w-[70px] justify-center`}>
//                             {priority}
//                           </Badge>
//                           <div className="flex-1 bg-slate-200 rounded-full h-3">
//                             <div 
//                               className={`h-full rounded-full transition-all duration-1000 ease-out ${
//                                 priority === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-red-600' :
//                                 priority === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
//                                 priority === 'MEDIUM' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
//                                 'bg-gradient-to-r from-green-500 to-green-600'
//                               }`}
//                               style={{ width: `${percentage}%` }}
//                             ></div>
//                           </div>
//                           <span className="text-sm font-semibold text-slate-700 min-w-[60px] text-right">
//                             {count} ({percentage}%)
//                           </span>
//                         </div>
//                       )
//                     })}
//                 </div>
//               </div>

//               {/* Component Services */}
//               <div className="space-y-4">
//                 <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                   <Users className="w-5 h-5 text-purple-600" />
//                   Component Services ({getUniqueComponents(selectedExistingFile.dataRecords)} unique)
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {[...new Set(selectedExistingFile.dataRecords.slice(0, 12).map(record => record.componentService))].map((component, index) => (
//                     <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
//                       {component}
//                     </Badge>
//                   ))}
//                   {getUniqueComponents(selectedExistingFile.dataRecords) > 12 && (
//                     <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">
//                       +{getUniqueComponents(selectedExistingFile.dataRecords) - 12} more
//                     </Badge>
//                   )}
//                 </div>
//               </div>

//               {/* Error Display */}
//               {uploadError && (
//                 <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
//                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//                   <p className="text-sm text-red-700 flex-1">{uploadError}</p>
//                 </div>
//               )}
//             </div>

//             {/* Dialog Footer */}
//             <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
//               <div className="flex flex-col sm:flex-row items-center gap-4">
//                 <div className="flex-1 text-center sm:text-left">
//                   <p className="text-sm text-slate-600 mb-1">Ready to analyze chaos engineering scenarios</p>
//                   <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
//                     <Shield className="w-3 h-3 text-green-500" />
//                     <span>All systems operational</span>
//                     <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
//                     <span>{selectedExistingFile.totalRecords} scenarios loaded</span>
//                   </div>
//                 </div>
//                 <div className="flex gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={closeDialog}
//                     className="border-slate-300 hover:border-slate-400 hover:bg-slate-50"
//                     disabled={isLoading}
//                   >
//                     <X className="w-4 h-4 mr-2" />
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={selectExistingFile}
//                     className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader className="w-4 h-4 mr-2 animate-spin" />
//                         Loading...
//                       </>
//                     ) : (
//                       <>
//                         <Play className="w-4 h-4 mr-2" />
//                         Start Analysis
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Database, 
  Search, 
  Loader, 
  AlertCircle, 
  Calendar, 
  Hash, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Component,
  Activity,
  Shield,
  BarChart3,
  Users,
  TrendingUp
} from "lucide-react"
import { getAllFiles, getFilesWithFilter } from "@/action/addData"

type FileRecord = {
  id: string
  filename: string
  originalFilename: string
  createdAt: Date
  updatedAt: Date
  totalRecords: number
  dataRecords: {
    id: string
    componentService: string
    scenarioName: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    possibilityOfIssues: string
  }[]
}

export default function Page() {
  const router = useRouter()
  const [selectedExistingFile, setSelectedExistingFile] = useState<FileRecord | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // For existing files table
  const [existingFiles, setExistingFiles] = useState<FileRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Pagination and responsive states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive height and items per page calculation
  useEffect(() => {
    const updateLayout = () => {
      const height = window.innerHeight
      const width = window.innerWidth
      setWindowHeight(height)
      setIsMobile(width < 768)
      
      // Calculate items per page based on available height
      // Account for header, search bar, pagination, etc.
      const availableHeight = height - (width < 768 ? 280 : 350) // Approximate height for other elements
      const rowHeight = width < 768 ? 70 : 60 // Approximate height per table row
      const calculatedItemsPerPage = Math.max(5, Math.floor(availableHeight / rowHeight))
      
      // Set responsive items per page
      if (width < 768) {
        setItemsPerPage(Math.min(calculatedItemsPerPage, 8)) // mobile: max 8 items
      } else if (width < 1024) {
        setItemsPerPage(Math.min(calculatedItemsPerPage, 12)) // tablet: max 12 items
      } else {
        setItemsPerPage(Math.min(calculatedItemsPerPage, 15)) // desktop: max 15 items
      }
    }
    
    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('orientationchange', updateLayout)
    
    return () => {
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('orientationchange', updateLayout)
    }
  }, [])

  // Load existing files on component mount
  useEffect(() => {
    loadExistingFiles()
  }, [])

  // Search files when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchFiles(searchTerm)
    } else {
      loadExistingFiles()
    }
    setCurrentPage(1) // Reset to first page on search
  }, [searchTerm])

  const loadExistingFiles = async () => {
    try {
      setIsSearching(true)
      const files = await getAllFiles()
      setExistingFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
      setUploadError('Failed to load files. Please refresh the page.')
    } finally {
      setIsSearching(false)
      setIsInitialLoading(false)
    }
  }

  const searchFiles = async (term: string) => {
    setIsSearching(true)
    try {
      const files = await getFilesWithFilter(term)
      setExistingFiles(files)
    } catch (error) {
      console.error('Error searching files:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFileSelect = (file: FileRecord) => {
    setSelectedExistingFile(file)
    setShowDialog(true)
    setUploadError(null)
  }

  const selectExistingFile = async () => {
    if (!selectedExistingFile) return

    setIsLoading(true)
    try {
      router.push(`/chos/${selectedExistingFile.id}`)
    } catch (error) {
      console.error('Navigation error:', error)
      setUploadError('Failed to load file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const closeDialog = () => {
    setShowDialog(false)
    setSelectedExistingFile(null)
    setUploadError(null)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Pagination logic
  const totalPages = Math.ceil(existingFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFiles = existingFiles.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateFull = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDominantPriority = (dataRecords: FileRecord['dataRecords']) => {
    const counts = dataRecords.reduce((acc, record) => {
      acc[record.priority] = (acc[record.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominant = Object.entries(counts).sort(([,a], [,b]) => b - a)[0]
    return dominant ? dominant[0] : 'MEDIUM'
  }

  const getPriorityStats = (dataRecords: FileRecord['dataRecords']) => {
    return dataRecords.reduce((acc, record) => {
      acc[record.priority] = (acc[record.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getUniqueComponents = (dataRecords: FileRecord['dataRecords']) => {
    return [...new Set(dataRecords.map(record => record.componentService))].length
  }

  // Calculate dynamic heights
  const sidebarHeight = isMobile ? 'auto' : '100vh'
  const tableHeight = windowHeight > 0 ? windowHeight - (isMobile ? 280 : 320) : 400
  const maxTableHeight = Math.min(tableHeight, windowHeight * 0.6) // Max 60% of viewport height

  return (
    <div className={`${isMobile ? 'min-h-screen' : 'h-screen'} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden`}>
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'min-h-screen' : 'h-screen'}`}>
          {/* Left Sidebar */}
          <div 
            className={`${isMobile ? 'w-full' : 'lg:w-80 xl:w-96'} bg-white/95 backdrop-blur-xl ${isMobile ? 'border-b' : 'border-r'} border-gray-200/70 shadow-2xl ${isMobile ? '' : 'overflow-hidden'}`}
            style={{ height: sidebarHeight }}
          >
            <div className={`p-3 lg:p-6 space-y-3 lg:space-y-6 ${isMobile ? '' : 'h-full overflow-y-auto'}`}>
              {/* Header Section */}
              <div className="text-center space-y-2 lg:space-y-4">
                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <Database className="w-5 h-5 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mb-1 lg:mb-2">
                    Data Library
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                    Chaos Engineering Analytics Platform
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1'} gap-2 lg:gap-4`}>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg lg:rounded-xl p-2 lg:p-4 border border-indigo-200">
                  <div className={`flex ${isMobile ? 'flex-col items-center' : 'lg:flex-row items-center'} gap-1 lg:gap-3`}>
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-md lg:rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3 h-3 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-sm lg:text-2xl font-bold text-indigo-900">{existingFiles.length}</div>
                      <div className="text-xs text-indigo-600">Files</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg lg:rounded-xl p-2 lg:p-4 border border-purple-200">
                  <div className={`flex ${isMobile ? 'flex-col items-center' : 'lg:flex-row items-center'} gap-1 lg:gap-3`}>
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md lg:rounded-lg flex items-center justify-center flex-shrink-0">
                      <Hash className="w-3 h-3 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-sm lg:text-2xl font-bold text-purple-900">
                        {existingFiles.reduce((sum, file) => sum + file.totalRecords, 0)}
                      </div>
                      <div className="text-xs text-purple-600">Scenarios</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg lg:rounded-xl p-2 lg:p-4 border border-green-200">
                  <div className={`flex ${isMobile ? 'flex-col items-center' : 'lg:flex-row items-center'} gap-1 lg:gap-3`}>
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-md lg:rounded-lg flex items-center justify-center flex-shrink-0">
                      <Component className="w-3 h-3 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-sm lg:text-2xl font-bold text-green-900">
                        {existingFiles.reduce((total, file) => total + getUniqueComponents(file.dataRecords), 0)}
                      </div>
                      <div className="text-xs text-green-600">Components</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status - Hidden on mobile to save space */}
              {!isMobile && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Data Status</div>
                        <div className="text-xs text-green-600 font-medium">All systems operational</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Security</div>
                        <div className="text-xs text-green-600 font-medium">Protected</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 p-3 lg:p-6 ${isMobile ? '' : 'overflow-hidden'}`}>
            <div className={`space-y-4 ${isMobile ? '' : 'h-full flex flex-col'}`}>
              {/* Error Display */}
              {uploadError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 flex-1">{uploadError}</p>
                  <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Search Section - Fixed */}
              <Card className={`bg-white/80 backdrop-blur-lg border-0 shadow-xl ${isMobile ? '' : 'flex-shrink-0'}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800 text-lg lg:text-xl">
                        <Database className="w-5 h-5 text-indigo-600" />
                        File Explorer
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Search and manage your chaos engineering data files
                      </CardDescription>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Search files, scenarios, or components..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-9 border-2 border-slate-200 focus:border-blue-500 bg-white/90 h-9 text-sm"
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                        {isSearching && (
                          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </div>

                    {/* Search Status */}
                    {(searchTerm || existingFiles.length > 0) && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between text-xs lg:text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          {searchTerm && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Search: {searchTerm}
                            </Badge>
                          )}
                          <span className="text-slate-600">
                            {existingFiles.length} file{existingFiles.length !== 1 ? 's' : ''} found
                          </span>
                        </div>
                        {searchTerm && (
                          <Button variant="outline" size="sm" onClick={clearSearch} className="text-xs h-7">
                            Clear Search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className={`pt-0 ${isMobile ? '' : 'flex-1 flex flex-col overflow-hidden'}`}>
                  {isInitialLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-500 font-medium">Loading data library...</span>
                      </div>
                    </div>
                  ) : existingFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No files found</h3>
                      <p className="text-slate-500 text-sm mb-4">
                        {searchTerm 
                          ? 'Try different search terms or clear the search to see all files' 
                          : 'Upload your first chaos engineering file to get started'
                        }
                      </p>
                      {searchTerm && (
                        <Button variant="outline" onClick={clearSearch} size="sm">
                          Clear Search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className={`space-y-4 ${isMobile ? '' : 'flex-1 flex flex-col overflow-hidden'}`}>
                      {/* Fixed Height Table Container */}
                      <div 
                        className={`bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200 ${isMobile ? '' : 'flex-1 flex flex-col overflow-hidden'}`}
                        style={{ maxHeight: isMobile ? 'none' : `${maxTableHeight}px` }}
                      >
                        <div className={`${isMobile ? 'overflow-x-auto' : 'flex-1 overflow-auto'}`}>
                          <table className="w-full">
                            <thead className="bg-slate-50/80 sticky top-0 z-10">
                              <tr>
                                <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[200px]">
                                  File Information
                                </th>
                                <th className={`px-3 lg:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${isMobile ? 'hidden' : 'sm:table-cell'}`}>
                                  Records
                                </th>
                                <th className={`px-3 lg:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${isMobile ? 'hidden' : 'md:table-cell'}`}>
                                  Components
                                </th>
                                <th className="px-3 lg:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                  Priority
                                </th>
                                <th className={`px-3 lg:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${isMobile ? 'hidden' : 'lg:table-cell'}`}>
                                  Created
                                </th>
                                <th className="px-3 lg:px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-12">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentFiles.map((file, index) => {
                                const dominantPriority = getDominantPriority(file.dataRecords)
                                const uniqueComponents = getUniqueComponents(file.dataRecords)

                                return (
                                  <tr
                                    key={file.id}
                                    onClick={() => handleFileSelect(file)}
                                    className={`cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/70 group ${
                                      index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                                    }`}
                                  >
                                    <td className={`px-3 lg:px-4 ${isMobile ? 'py-4' : 'py-3'}`}>
                                      <div className="flex items-center gap-2 lg:gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                                          <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold text-slate-900 truncate">
                                            {file.filename}
                                          </div>
                                          <div className={`text-xs text-slate-600 truncate ${isMobile ? 'max-w-[120px]' : 'lg:max-w-none max-w-[150px]'}`}>
                                            {file.originalFilename}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className={`px-3 lg:px-4 py-3 ${isMobile ? 'hidden' : 'sm:table-cell'}`}>
                                      <div className="flex items-center gap-1">
                                        <Hash className="w-3 h-3 text-blue-600" />
                                        <span className="text-sm font-semibold text-slate-800">{file.totalRecords}</span>
                                      </div>
                                    </td>
                                    <td className={`px-3 lg:px-4 py-3 ${isMobile ? 'hidden' : 'md:table-cell'}`}>
                                      <div className="flex items-center gap-1">
                                        <Component className="w-3 h-3 text-purple-600" />
                                        <span className="text-sm text-slate-700">{uniqueComponents}</span>
                                      </div>
                                    </td>
                                    <td className={`px-3 lg:px-4 ${isMobile ? 'py-4' : 'py-3'}`}>
                                      <Badge className={`${getPriorityColor(dominantPriority)} border text-xs px-2 py-1`}>
                                        {dominantPriority}
                                      </Badge>
                                    </td>
                                    <td className={`px-3 lg:px-4 py-3 ${isMobile ? 'hidden' : 'lg:table-cell'}`}>
                                      <div className="text-xs text-slate-600">
                                        {formatDate(file.createdAt)}
                                      </div>
                                    </td>
                                    <td className={`px-3 lg:px-4 ${isMobile ? 'py-4' : 'py-3'} text-center`}>
                                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 mx-auto" />
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Fixed Pagination at Bottom */}
                      {totalPages > 1 && (
                        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 ${isMobile ? '' : 'flex-shrink-0'}`}>
                          <div className="text-xs text-slate-600 order-2 sm:order-1">
                            {startIndex + 1}-{Math.min(endIndex, existingFiles.length)} of {existingFiles.length}
                          </div>
                          
                          <div className="flex items-center gap-1 order-1 sm:order-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-8 px-2 lg:px-3 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span className="hidden sm:inline ml-1">Prev</span>
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {/* Responsive pagination numbers */}
                              {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(currentPage - Math.floor((isMobile ? 3 : 5) / 2), totalPages - (isMobile ? 2 : 4))) + i
                                if (pageNum > totalPages) return null
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={pageNum === currentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(pageNum)}
                                    className={`h-8 w-8 p-0 text-xs ${
                                      pageNum === currentPage 
                                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600 text-white shadow-lg' 
                                        : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="h-8 px-2 lg:px-3 text-xs border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                              <span className="hidden sm:inline mr-1">Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* File Details Dialog */}
      {showDialog && selectedExistingFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl border-0 overflow-hidden"
            style={{ 
              maxHeight: isMobile ? '90vh' : '85vh',
              height: isMobile ? 'auto' : 'fit-content'
            }}
          >
            {/* Dialog Header */}
            <div className="text-blue-800  px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between"> 
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-blue-800" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold truncate`}>{selectedExistingFile.filename}</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-800/50 truncate`}>{selectedExistingFile.originalFilename}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDialog}
                  className="text-white hover:bg-white/20 rounded-xl flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Dialog Content */}
            <div 
              className="p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto"
              style={{ 
                maxHeight: isMobile ? 'calc(90vh - 160px)' : 'calc(85vh - 180px)'
              }}
            >
              {/* Quick Stats */}
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3 lg:gap-4`}>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 lg:p-4 text-center border border-blue-200">
                  <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mx-auto mb-2" />
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-900`}>{selectedExistingFile.totalRecords}</div>
                  <div className="text-xs text-blue-600">Scenarios</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 lg:p-4 text-center border border-purple-200">
                  <Component className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 mx-auto mb-2" />
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-900`}>{getUniqueComponents(selectedExistingFile.dataRecords)}</div>
                  <div className="text-xs text-purple-600">Components</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 lg:p-4 text-center border border-green-200">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 mx-auto mb-2" />
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-green-900`}>{formatDateFull(selectedExistingFile.createdAt)}</div>
                  <div className="text-xs text-green-600">Created</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 lg:p-4 text-center border border-orange-200">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 mx-auto mb-2" />
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-900`}>Ready</div>
                  <div className="text-xs text-orange-600">Status</div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="space-y-3 lg:space-y-4">
                <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-slate-800 flex items-center gap-2`}>
                  <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                  Priority Distribution
                </h4>
                <div className="space-y-2 lg:space-y-3">
                  {Object.entries(getPriorityStats(selectedExistingFile.dataRecords))
                    .sort(([,a], [,b]) => b - a)
                    .map(([priority, count]) => {
                      const percentage = (count / selectedExistingFile.totalRecords * 100).toFixed(1)
                      return (
                        <div key={priority} className="flex items-center gap-2 lg:gap-3">
                          <Badge className={`${getPriorityColor(priority)} border text-xs min-w-[60px] lg:min-w-[70px] justify-center`}>
                            {priority}
                          </Badge>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 lg:h-3">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                priority === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                priority === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                priority === 'MEDIUM' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-slate-700 min-w-[50px] lg:min-w-[60px] text-right`}>
                            {count} ({percentage}%)
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Component Services */}
              <div className="space-y-3 lg:space-y-4">
                <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-slate-800 flex items-center gap-2`}>
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                  Component Services ({getUniqueComponents(selectedExistingFile.dataRecords)} unique)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(selectedExistingFile.dataRecords.slice(0, isMobile ? 8 : 12).map(record => record.componentService))].map((component, index) => (
                    <Badge key={index} variant="secondary" className={`bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {component}
                    </Badge>
                  ))}
                  {getUniqueComponents(selectedExistingFile.dataRecords) > (isMobile ? 8 : 12) && (
                    <Badge variant="secondary" className={`bg-slate-100 text-slate-600 border border-slate-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      +{getUniqueComponents(selectedExistingFile.dataRecords) - (isMobile ? 8 : 12)} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {uploadError && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-700 flex-1`}>{uploadError}</p>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 lg:px-6 py-3 lg:py-4 border-t border-slate-200 flex-shrink-0">
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} items-center gap-3 lg:gap-4`}>
                <div className={`flex-1 ${isMobile ? 'text-center' : 'text-center sm:text-left'}`}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-600 mb-1`}>Ready to analyze chaos engineering scenarios</p>
                  <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-center sm:justify-start'} gap-2 text-xs text-slate-500`}>
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>All systems operational</span>
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span>{selectedExistingFile.totalRecords} scenarios loaded</span>
                  </div>
                </div>
                <div className={`flex gap-2 lg:gap-3 ${isMobile ? 'w-full' : ''}`}>
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    className={`border-slate-300 hover:border-slate-400 hover:bg-slate-50 ${isMobile ? 'flex-1' : ''}`}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={selectExistingFile}
                    className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${isMobile ? 'flex-1' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}