"use client"

import { use } from "react"
import FileDetailsPage from "@/components/chos_Dashboard/filedetails" // Adjust path as needed

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default function Page({ params }: PageProps) {
  // Use the `use` hook to unwrap the Promise
  const resolvedParams = use(params)
  
  return <FileDetailsPage fileId={resolvedParams.id} />
}