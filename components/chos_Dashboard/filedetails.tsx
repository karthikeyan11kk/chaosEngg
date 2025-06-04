"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  ArrowLeft,
  Loader,
  AlertTriangle,
  Database,
  Search,
  Grid3X3,
  Table,
  BarChart3,
  Filter,
  Eye,
  Component,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getFileById } from "@/action/addData";

type DataRecord = {
  id: string;
  componentService: string;
  scenarioName: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  possibilityOfIssues: string;
  detected: boolean;
};

type FileRecord = {
  id: string;
  filename: string;
  originalFilename: string;
  createdAt: Date;
  updatedAt: Date;
  dataRecords?: DataRecord[];
};

// Type for the raw data coming from the database
type RawDataRecord = {
  fileId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  componentService: string;
  scenarioName: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  possibilityOfIssues: string;
  // Note: 'detected' property is missing in raw data
};

type RawFileData = {
  id: string;
  filename: string;
  originalFilename: string;
  createdAt: Date;
  updatedAt: Date;
  dataRecords: RawDataRecord[];
};

interface FileDetailsPageProps {
  fileId: string;
}

export default function FileDetailsPage({ fileId }: FileDetailsPageProps) {
  const router = useRouter();

  const [file, setFile] = useState<FileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("cards");
  const [mainTab, setMainTab] = useState("view-data");

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [componentFilter, setComponentFilter] = useState<string>("all");

  // Helper function to transform raw data to match FileRecord type
  const transformFileData = (rawData: RawFileData): FileRecord => {
    return {
      id: rawData.id,
      filename: rawData.filename,
      originalFilename: rawData.originalFilename,
      createdAt: rawData.createdAt,
      updatedAt: rawData.updatedAt,
      dataRecords: rawData.dataRecords.map((record) => ({
        id: record.id,
        componentService: record.componentService,
        scenarioName: record.scenarioName,
        description: record.description,
        priority: record.priority,
        possibilityOfIssues: record.possibilityOfIssues,
        detected: false, // Default value for missing 'detected' property
      })),
    };
  };

  // Move loadFileDetails to useCallback to avoid dependency issues
  const loadFileDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const rawFileData = await getFileById(fileId);

      if (!rawFileData) {
        setError("File not found");
        return;
      }

      // Transform the raw data to match our FileRecord type
      const transformedData = transformFileData(rawFileData as RawFileData);
      setFile(transformedData);
    } catch (err) {
      console.error("Error loading file:", err);
      setError("Failed to load file details");
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) {
      loadFileDetails();
    }
  }, [fileId, loadFileDetails]);

  // Get unique components for the filter dropdown - moved before early returns
  const uniqueComponents = useMemo(() => {
    if (!file?.dataRecords) return [];

    const components = Array.from(
      new Set(file.dataRecords.map((record) => record.componentService))
    ).sort();

    return components;
  }, [file?.dataRecords]);

  // Filter data based on search query, priority, and component - moved before early returns
  const filteredData = useMemo(() => {
    if (!file?.dataRecords) return [];

    return file.dataRecords.filter((record) => {
      const matchesSearch =
        searchQuery === "" ||
        record.componentService
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.scenarioName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || record.priority === priorityFilter;
      const matchesComponent =
        componentFilter === "all" ||
        record.componentService === componentFilter;

      return matchesSearch && matchesPriority && matchesComponent;
    });
  }, [file?.dataRecords, searchQuery, priorityFilter, componentFilter]);

  // Analytics calculations based on filtered data - moved before early returns
  const analytics = useMemo(() => {
    if (!filteredData.length) return null;

    const total = filteredData.length;
    const detected = filteredData.filter((r) => r.detected).length;
    const priorities = filteredData.reduce((acc, record) => {
      acc[record.priority] = (acc[record.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Chart data
    const priorityData = Object.entries(priorities).map(
      ([priority, count]) => ({
        name: priority,
        value: count,
        color:
          priority === "HIGH"
            ? "#f97316"
            : priority === "MEDIUM"
            ? "#eab308"
            : "#22c55e",
      })
    );

    return {
      total,
      detected,
      undetected: total - detected,
      priorities,
      detectionRate: total > 0 ? Math.round((detected / total) * 100) : 0,
      priorityData,
    };
  }, [filteredData]);

  // Helper function
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setComponentFilter("all");
  };

  // Fixed: Early returns are now after all hook calls
  if (!fileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-semibold text-slate-700">
              Loading...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-semibold text-slate-700">
              Loading file details...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600 mb-4">{error || "File not found"}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const CardView = () => (
    <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((record) => (
          <Card
            key={record.id}
            className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
                    {record.componentService}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {record.scenarioName}
                  </CardDescription>
                </div>
                <Badge
                  className={`${getPriorityColor(
                    record.priority
                  )} border text-xs`}
                >
                  {record.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-slate-700 line-clamp-3">
                  {record.description}
                </p>
                {record.possibilityOfIssues && (
                  <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800 font-medium">
                      Potential Issues:
                    </p>
                    <p className="text-xs text-amber-700 line-clamp-2">
                      {record.possibilityOfIssues}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TableView = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden">
      <div className="max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Component Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Scenario
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.map((record, index) => (
              <tr
                key={record.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {record.componentService}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {record.scenarioName}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={`${getPriorityColor(
                      record.priority
                    )} border text-xs`}
                  >
                    {record.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                  <div className="line-clamp-2">{record.description}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Filter Information Card */}
      <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            Current Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>        
          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-blue-700">Active Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Search: {searchQuery}
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Priority: {priorityFilter}
              </Badge>
            )}
            {componentFilter !== "all" && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Component: {componentFilter}
              </Badge>
            )}
            {(searchQuery || priorityFilter !== "all" || componentFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="ml-2 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <>
          {/* Priority Distribution Chart */}
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Component Analysis Table */}
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Component Analysis Details
              </CardTitle>
              <CardDescription>
                Detailed breakdown of components with descriptions, issues, and priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Component Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Possibility of Issues
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredData.map((record, index) => (
                      <tr
                        key={record.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {record.componentService}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`${getPriorityColor(
                              record.priority
                            )} border text-xs`}
                          >
                            {record.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-md">
                          <div className="break-words">{record.description}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-md">
                          <div className="break-words">
                            {record.possibilityOfIssues || "No issues identified"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Files
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Information Card with Tabs - Sticky */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-blue-600" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-600">
                      {file.originalFilename}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Total Records:</span>
                    <Badge variant="secondary">
                      {file.dataRecords?.length || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Filtered:</span>
                    <Badge variant="secondary">{filteredData.length}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Component className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Components:</span>
                    <Badge variant="secondary">{uniqueComponents.length}</Badge>
                  </div>
                </div>

                {/* Main Navigation Tabs */}
                <Tabs
                  value={mainTab}
                  onValueChange={setMainTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="view-data"
                      className="flex items-center gap-2 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      View Data
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="flex items-center gap-2 text-xs"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {mainTab === "view-data" && (
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Database className="w-5 h-5 text-indigo-600" />
                        Component Services Analysis
                      </CardTitle>
                      <CardDescription>
                        Search and analyze component service data records
                      </CardDescription>
                    </div>

                    {/* Enhanced Search and Filter Controls */}
                    <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            placeholder="Search component services, scenarios, or descriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-2 border-slate-200 focus:border-blue-500"
                          />
                        </div>

                        {/* Component Filter */}
                        <Select
                          value={componentFilter}
                          onValueChange={setComponentFilter}
                        >
                          <SelectTrigger className="w-48 border-2 border-slate-200">
                            <Component className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Components" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Components</SelectItem>
                            {uniqueComponents.map((component) => (
                              <SelectItem key={component} value={component}>
                                {component}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Priority Filter */}
                      {/* Priority Filter */}
                        <Select
                          value={priorityFilter}
                          onValueChange={setPriorityFilter}
                        >
                          <SelectTrigger className="w-36 border-2 border-slate-200">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Active Filters Display */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium text-slate-600">
                          Active Filters:
                        </span>
                        {searchQuery && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Search: {searchQuery}
                          </Badge>
                        )}
                        {priorityFilter !== "all" && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Priority: {priorityFilter}
                          </Badge>
                        )}
                        {componentFilter !== "all" && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            Component: {componentFilter}
                          </Badge>
                        )}
                        {(searchQuery || priorityFilter !== "all" || componentFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="ml-2 text-slate-600 border-slate-300 hover:bg-slate-50"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* View Toggle Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cards" className="flex items-center gap-2">
                          <Grid3X3 className="w-4 h-4" />
                          Card View
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex items-center gap-2">
                          <Table className="w-4 h-4" />
                          Table View
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        No data found
                      </h3>
                      <p className="text-slate-500 mb-4">
                        No records match your current search and filter criteria.
                      </p>
                      {(searchQuery || priorityFilter !== "all" || componentFilter !== "all") && (
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsContent value="cards" className="mt-4">
                        <CardView />
                      </TabsContent>
                      <TabsContent value="table" className="mt-4">
                        <TableView />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            )}
            {mainTab === "analytics" && <AnalyticsView />}
          </div>
        </div>
      </div>
    </div>
  );
}