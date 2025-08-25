"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Upload, FileText, Zap, Shield, CheckCircle2, ArrowRight, Loader, AlertCircle, Eye, Home } from "lucide-react"
import { createFileWithChaosScenarios } from "@/action/addData"
import Papa from 'papaparse'

type ChaosScenarioData = {
  componentService: string
  scenarioName: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  possibilityOfIssues: string
  detected?: boolean
}

// Define CSV row interface
interface CSVRow {
  [key: string]: string | number | boolean | null | undefined
}

// Define Papa Parse results interface
interface PapaParseResult {
  data: CSVRow[]
  errors: Array<{
    type: string
    code: string
    message: string
    row?: number
  }>
  meta: {
    delimiter: string
    linebreak: string
    aborted: boolean
    truncated: boolean
    cursor: number
  }
}

export default function Page() {
  const router = useRouter()
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setUploadError(null)
      if (!fileName) {
        // Auto-populate filename from uploaded file
        setFileName(file.name.replace('.csv', ''))
      }
    } else if (file) {
      setUploadError('Please select a CSV file only.')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/csv') {
        setSelectedFile(file)
        setUploadError(null)
        if (!fileName) {
          setFileName(file.name.replace('.csv', ''))
        }
      } else {
        setUploadError('Please drop a CSV file only.')
      }
    }
  }

  const validatePriority = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    const upperPriority = priority.toUpperCase().trim()
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(upperPriority)) {
      return upperPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    }
    return 'MEDIUM' // Default fallback
  }

const parseCSVFile = (file: File): Promise<ChaosScenarioData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header: string) => {
        // Normalize headers to handle various formats
        return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      },
      complete: (results: PapaParseResult) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          // Column mapping for flexible CSV formats
          const columnMappings = {
            componentService: [
              'componentservice', 'component_service', 'component', 'service',
              'componentname', 'component_name', 'servicename', 'service_name'
            ],
            scenarioName: [
              'scenarioname', 'scenario_name', 'scenario', 'name', 'testname',
              'test_name', 'chaosscenario', 'chaos_scenario'
            ],
            description: [
              'description', 'desc', 'details', 'summary', 'info',
              'testdescription', 'test_description'
            ],
            priority: [
              'priority', 'severity', 'level', 'importance', 'criticality'
            ],
            possibilityOfIssues: [
              'possibilityofissues', 'possibility_of_issues', 'possibility',
              'issues', 'impact', 'consequences', 'effects', 'risks',
            ],
          };

          const findColumnValue = (row: CSVRow, mappings: string[], defaultValue: string = '') => {
            for (const mapping of mappings) {
              if (row[mapping] !== undefined && row[mapping] !== null && row[mapping] !== '') {
                return String(row[mapping]).trim();
              }
            }
            return defaultValue;
          };

          const chaosScenarios: ChaosScenarioData[] = results.data
            .filter((row: CSVRow) => row && typeof row === 'object')
            .map((row: CSVRow, index: number) => {
              const componentService = findColumnValue(
                row, 
                columnMappings.componentService, 
                `Component-${index + 1}`
              );
              
              const scenarioName = findColumnValue(
                row, 
                columnMappings.scenarioName, 
                `Scenario-${index + 1}`
              );
              
              const description = findColumnValue(
                row, 
                columnMappings.description, 
                'No description provided'
              );
              
              const priorityValue = findColumnValue(row, columnMappings.priority, 'MEDIUM');
              const priority = validatePriority(priorityValue);
              
              const possibilityOfIssues = findColumnValue(
                row, 
                columnMappings.possibilityOfIssues, 
                'Not specified'
              );
              
              return {
                componentService,
                scenarioName,
                description,
                priority,
                possibilityOfIssues,
              };
            })
            .filter((scenario: ChaosScenarioData)=> 
              scenario.componentService && 
              scenario.scenarioName && 
              scenario.componentService !== 'undefined' && 
              scenario.scenarioName !== 'undefined' &&
              scenario.componentService.length > 0 &&
              scenario.scenarioName.length > 0
            );

          if (chaosScenarios.length === 0) {
            reject(new Error('No valid data rows found in CSV. Please check your CSV format and ensure it contains the required columns.'));
            return;
          }

          // Log successful parsing info
          console.log(`Successfully parsed ${chaosScenarios.length} chaos scenarios from CSV`);
          
          resolve(chaosScenarios);
        } catch (error) {
          reject(new Error(`Error processing CSV data: ${error}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    });
  });
};

  const uploadFile = async () => {
    if (!selectedFile || !fileName.trim()) {
      setUploadError('Please provide both a file name and select a CSV file.')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress("Initializing upload...")

    try {
      // Step 1: Parse CSV file
      setUploadProgress("Reading and parsing CSV file...")
      const chaosScenarios = await parseCSVFile(selectedFile)
      
      if (chaosScenarios.length === 0) {
        throw new Error('No valid data found in the CSV file.')
      }

      setUploadProgress(`Processing ${chaosScenarios.length} records...`)

      // Step 2: Create file record with chaos scenarios
      setUploadProgress("Saving data to database...")
      const result = await createFileWithChaosScenarios(
        {
          filename: fileName.trim(),
          originalFilename: selectedFile.name
        },
        chaosScenarios
      )

      if (result.success && result.file) {
        setUploadProgress("Upload completed successfully!")
        
        // Small delay to show success message
        setTimeout(() => {
          router.push(`/chos/${result.file.id}`)
        }, 1000)
      } else {
        throw new Error(result.error || 'Failed to save data to database')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.')
      setUploadProgress("")
    } finally {
      if (!uploadError) {
        // Only reset uploading state if there was no error
        setTimeout(() => setIsUploading(false), 1500)
      } else {
        setIsUploading(false)
      }
    }
  }

  const viewExistingFiles = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500/30 rotate-45 animate-bounce" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500/30 rounded-full animate-bounce" style={{animationDelay: '3s'}} />
        <div className="absolute top-2/3 right-1/4 w-1 h-4 sm:w-1 sm:h-6 bg-indigo-500/30 animate-bounce" style={{animationDelay: '5s'}} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8 lg:py-8 min-h-screen flex flex-col justify-center">
        <div className="w-full max-w-2xl lg:max-w-3xl mx-auto">
          {/* Enhanced Hero Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse" />
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700 tracking-wide">CHAOS ENGINEERING</span>
            </div>
            
            <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight tracking-tight px-2">
              Transform Your
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block sm:inline"> Data Workflow</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 px-2">
              {[
                { icon: CheckCircle2, text: "Choose File" },
                { icon: Shield, text: "Upload File" },
                { icon: Zap, text: "Processed Data" }
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-700 border border-white/30">
                  <badge.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                  <span className="hidden xs:inline sm:inline">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Button */}
          <div className="text-center mb-4 sm:mb-6">
            <Button
              onClick={viewExistingFiles}
              variant="outline"
              className="bg-white/80 backdrop-blur-lg border border-white/30 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-xl group"
            >
              <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">View Existing Files</span>
              <span className="sm:hidden">View Files</span>
              <Home className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>

          {/* Error Display */}
          {uploadError && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 text-sm">
                  <p className="font-medium mb-1">Upload Error</p>
                  <p className="text-xs sm:text-sm">{uploadError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Display */}
          {isUploading && uploadProgress && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-spin flex-shrink-0" />
                <div className="text-blue-700 text-sm">
                  <p className="font-medium text-xs sm:text-sm">{uploadProgress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Upload Card */}
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-2">
                    Upload & Process Your Data
                  </h3>
                  <p className="text-slate-600 text-sm px-2">
                    Drag & drop your CSV file or browse to get started with intelligent data processing
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {/* File Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="fileName" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      File Name
                    </Label>
                    <Input
                      id="fileName"
                      type="text"
                      placeholder="Enter a descriptive name for your file..."
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="h-10 sm:h-11 text-sm border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-lg bg-white/80 backdrop-blur-sm"
                      disabled={isUploading}
                    />
                  </div>

                  {/* Enhanced File Upload with Drag & Drop */}
                  <div className="space-y-2">
                    <Label htmlFor="csvFile" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Upload className="w-3 h-3" />
                      CSV File
                    </Label>
                    <div 
                      className={`relative border-3 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 bg-white/60 backdrop-blur-sm ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50/80 scale-105' 
                          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80'
                      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <div className="text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                          {isUploading ? (
                            <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1 px-2">
                          {selectedFile ? (
                            <span className="break-all">{selectedFile.name}</span>
                          ) : (
                            'Drop your CSV file here'
                          )}
                        </p>
                        <p className="text-slate-500 text-xs px-2">
                          {isUploading ? 'Processing...' : 'or click to browse your files'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Submit Button */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={uploadFile}
                    size="lg"
                    disabled={!selectedFile || !fileName.trim() || isUploading}
                    className="w-full h-11 sm:h-12 lg:h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Processing File...</span>
                        <span className="sm:hidden">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        <span className="hidden sm:inline">Process & Analyze File</span>
                        <span className="sm:hidden">Process File</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}