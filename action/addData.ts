"use server"

import { db } from "@/lib/db" // Adjust path to your Prisma client
import { revalidatePath } from "next/cache"

// Get all files with their chaos scenarios
export const getAllFiles = async () => {
  return await db.file.findMany({
    include: {
      dataRecords: {
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

// Get file by ID with all its chaos scenarios
export const getFileById = async (id: string) => {
  return await db.file.findUnique({
    where: { id },
    include: {
      dataRecords: {
        orderBy: {
          scenarioName: 'asc'
        }
      },
    }
  })
}

// Create new file record
export const createFile = async (data: {
  filename: string
  originalFilename: string
  totalRecords?: number
}) => {
  try {
    const file = await db.file.create({
      data: {
        filename: data.filename,
        originalFilename: data.originalFilename,
        totalRecords: data.totalRecords || 0,
      }
    })
    
    revalidatePath('/')
    return { success: true, file }
  } catch (error) {
    console.error('Error creating file:', error)
    return { success: false, error: 'Failed to create file record' }
  }
}

// Create file with multiple chaos scenarios (for CSV import)
export const createFileWithChaosScenarios = async (
  fileData: {
    filename: string
    originalFilename: string
  },
  chaosScenarios: {
    componentService: string
    scenarioName: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    possibilityOfIssues: string
  }[]
) => {
  try {
    const result = await db.file.create({
      data: {
        filename: fileData.filename,
        originalFilename: fileData.originalFilename,
        totalRecords: chaosScenarios.length,
        dataRecords: {
          create: chaosScenarios.map(scenario => ({
            componentService: scenario.componentService,
            scenarioName: scenario.scenarioName,
            description: scenario.description,
            priority: scenario.priority,
            possibilityOfIssues: scenario.possibilityOfIssues,
          }))
        }
      },
      include: {
        dataRecords: true,
      }
    })
    
    revalidatePath('/')
    return { success: true, file: result }
  } catch (error) {
    console.error('Error creating file with chaos scenarios:', error)
    return { success: false, error: 'Failed to create file with chaos scenarios' }
  }
}

// Add single chaos scenario to existing file
export const addChaosScenario = async (
  fileId: string,
  scenarioData: {
    componentService: string
    scenarioName: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    possibilityOfIssues: string
  }
) => {
  try {
    const scenario = await db.chaosScenario.create({
      data: {
        fileId,
        componentService: scenarioData.componentService,
        scenarioName: scenarioData.scenarioName,
        description: scenarioData.description,
        priority: scenarioData.priority,
        possibilityOfIssues: scenarioData.possibilityOfIssues,
      },
      include: {
        file: true,
      }
    })

    // Update total records count
    await db.file.update({
      where: { id: fileId },
      data: {
        totalRecords: {
          increment: 1
        }
      }
    })
    
    revalidatePath('/')
    return { success: true, scenario }
  } catch (error) {
    console.error('Error adding chaos scenario:', error)
    return { success: false, error: 'Failed to add chaos scenario' }
  }
}

// Update chaos scenario
export const updateChaosScenario = async (
  scenarioId: string,
  data: {
    componentService?: string
    scenarioName?: string
    description?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    possibilityOfIssues?: string
  }
) => {
  try {
    const result = await db.chaosScenario.update({
      where: { id: scenarioId },
      data,
      include: {
        file: true,
      }
    })
    
    revalidatePath('/')
    return { success: true, scenario: result }
  } catch (error) {
    console.error('Error updating chaos scenario:', error)
    return { success: false, error: 'Failed to update chaos scenario' }
  }
}

// Delete single chaos scenario
export const deleteChaosScenario = async (scenarioId: string) => {
  try {
    const scenario = await db.chaosScenario.findUnique({
      where: { id: scenarioId },
      select: { fileId: true }
    })

    if (!scenario) {
      return { success: false, error: 'Scenario not found' }
    }

    await db.chaosScenario.delete({
      where: { id: scenarioId }
    })

    // Update total records count
    await db.file.update({
      where: { id: scenario.fileId },
      data: {
        totalRecords: {
          decrement: 1
        }
      }
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting chaos scenario:', error)
    return { success: false, error: 'Failed to delete chaos scenario' }
  }
}

// Delete file (will cascade delete all chaos scenarios)
export const deleteFile = async (id: string) => {
  try {
    await db.file.delete({
      where: { id }
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

// Get files with search/filter
export const getFilesWithFilter = async (searchTerm?: string) => {
  return await db.file.findMany({
    where: searchTerm ? {
      OR: [
        { filename: { contains: searchTerm, mode: 'insensitive' } },
        { originalFilename: { contains: searchTerm, mode: 'insensitive' } },
        { 
          dataRecords: {
            some: {
              OR: [
                { componentService: { contains: searchTerm, mode: 'insensitive' } },
                { scenarioName: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } }
              ]
            }
          }
        }
      ]
    } : {},
    include: {
      dataRecords: {
        orderBy: {
          scenarioName: 'asc'
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

// Get chaos scenarios with filters
export const getChaosScenarios = async (filters?: {
  fileId?: string
  componentService?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  searchTerm?: string
}) => {
  const where: any = {}

  if (filters?.fileId) {
    where.fileId = filters.fileId
  }

  if (filters?.componentService) {
    where.componentService = { contains: filters.componentService, mode: 'insensitive' }
  }

  if (filters?.priority) {
    where.priority = filters.priority
  }

  if (filters?.searchTerm) {
    where.OR = [
      { scenarioName: { contains: filters.searchTerm, mode: 'insensitive' } },
      { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      { possibilityOfIssues: { contains: filters.searchTerm, mode: 'insensitive' } }
    ]
  }

  return await db.chaosScenario.findMany({
    where,
    include: {
      file: {
        select: {
          id: true,
          filename: true,
          originalFilename: true
        }
      }
    },
    orderBy: [
      { priority: 'desc' },
      { scenarioName: 'asc' }
    ]
  })
}
