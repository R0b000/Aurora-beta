import React, { useState, useCallback, useRef } from 'react'

export interface UploadedFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
  public_id?: string
  secure_url?: string
}

export interface FileTypeBinding {
  name: string
  accept: string
  extensions: string[]
  icon?: React.ReactNode
  color?: string
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  onUpload?: (files: File[]) => Promise<void>
  onChange?: (files: UploadedFile[]) => void
  value?: UploadedFile[]
  showPreview?: boolean
  disabled?: boolean
  className?: string
  label?: string
  helperText?: string
  fileTypes?: FileTypeBinding[]
  enforceTypes?: boolean
  uploadUrl?: string
  folder?: string
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  onUpload,
  onChange,
  value = [],
  showPreview = true,
  disabled = false,
  className = '',
  label,
  helperText,
  fileTypes = [],
  enforceTypes = false,
  uploadUrl,
  folder,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const getFileTypeCategory = (file: File): FileTypeBinding | undefined => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return fileTypes.find((ft) => ft.extensions.includes(extension))
  }

  const uploadToCloudinary = async (file: File): Promise<{ public_id: string; secure_url: string }> => {
    if (!uploadUrl) {
      throw new Error('Upload URL not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    if (folder) {
      formData.append('folder', folder)
    }

    const authHeader: Record<string, string> = {}
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('actualToken')
      if (token) {
        authHeader.Authorization = `Bearer ${token}`
      }
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: authHeader,
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Upload failed')
    }

    const result = await response.json()
    return result.data
  }

  const processFiles = useCallback(
    async (rawFiles: FileList | File[]) => {
      const files = Array.from(rawFiles)
      const validFiles: File[] = []
      let error = ''

      for (const file of files) {
        if (files.length + internalFiles.length > maxFiles) {
          error = `Maximum ${maxFiles} files allowed`
          break
        }
        if (file.size > maxSizeBytes) {
          error = `${file.name} exceeds ${maxSizeMB}MB limit`
          break
        }
        if (enforceTypes && fileTypes.length > 0) {
          const matchedType = getFileTypeCategory(file)
          if (!matchedType && !accept) {
            error = `File type not allowed: ${file.name}`
            break
          }
        }
        validFiles.push(file)
      }

      if (error) {
        alert(error)
        return
      }

      const uploads: UploadedFile[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
      }))

      const updated = [...internalFiles, ...uploads]
      setInternalFiles(updated)
      onChange?.(updated)

      if (uploadUrl) {
        const results = await Promise.allSettled(
          validFiles.map((file) => uploadToCloudinary(file))
        )

        const completed = uploads.map((upload, index) => {
          const result = results[index]
          if (result.status === 'fulfilled') {
            return {
              ...upload,
              progress: 100,
              status: 'done' as const,
              public_id: result.value.public_id,
              secure_url: result.value.secure_url,
            }
          }
          return {
            ...upload,
            status: 'error' as const,
            error: result.reason instanceof Error ? result.reason.message : 'Upload failed',
          }
        })

        const finalFiles = [...internalFiles, ...completed]
        setInternalFiles(finalFiles)
        onChange?.(finalFiles)
      } else if (onUpload) {
        try {
          await onUpload(validFiles)
          const done = updated.map((f) => ({ ...f, progress: 100, status: 'done' as const }))
          setInternalFiles(done)
          onChange?.(done)
        } catch (err) {
          const failed = updated.map((f) => ({
            ...f,
            status: 'error' as const,
            error: err instanceof Error ? err.message : 'Upload failed',
          }))
          setInternalFiles(failed)
          onChange?.(failed)
        }
      } else {
        const done = updated.map((f) => ({ ...f, progress: 100, status: 'done' as const }))
        setInternalFiles(done)
        onChange?.(done)
      }
    },
    [internalFiles, maxFiles, maxSizeBytes, maxSizeMB, onUpload, onChange, fileTypes, enforceTypes, accept, uploadUrl, folder]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (!disabled) processFiles(e.dataTransfer.files)
    },
    [processFiles, disabled]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      const updated = internalFiles.filter((f) => f.id !== id)
      setInternalFiles(updated)
      onChange?.(updated)
    },
    [internalFiles, onChange]
  )

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 flex flex-col items-center justify-center gap-3
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-700">
            Drag files here or <span className="text-blue-600 underline">browse</span>
          </p>
          {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
          {!helperText && (
            <p className="text-xs text-gray-400 mt-1">
              {fileTypes.length > 0
                ? `Allowed: ${fileTypes.map(ft => ft.name).join(', ')}. Max ${maxFiles} files, each up to ${maxSizeMB}MB`
                : `Max ${maxFiles} files, each up to ${maxSizeMB}MB`
              }
            </p>
          )}
        </div>
      </div>

      {showPreview && internalFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {internalFiles.map((uploaded) => {
            const matchedType = getFileTypeCategory(uploaded.file)
            return (
              <div
                key={uploaded.id}
                className="relative group rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
              >
                {uploaded.file.type.startsWith('image/') ? (
                  <img src={uploaded.preview} alt={uploaded.file.name} className="w-full h-24 object-cover" />
                ) : matchedType?.icon ? (
                  <div className="w-full h-24 flex items-center justify-center" style={{ backgroundColor: matchedType.color || '#F3F4F6' }}>
                    <span className="scale-150">{matchedType.icon}</span>
                  </div>
                ) : (
                  <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate font-medium">{uploaded.file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(uploaded.file.size)}</p>
                  {matchedType && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded-md font-medium" style={{ backgroundColor: (matchedType.color || '#E5E7EB') + '33', color: matchedType.color || '#4B5563' }}>
                      {matchedType.name}
                    </span>
                  )}
                  {uploaded.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: '60%' }}
                      />
                    </div>
                  )}
                  {uploaded.status === 'done' && (
                    <span className="text-xs text-green-600 font-medium">Uploaded</span>
                  )}
                  {uploaded.status === 'error' && (
                    <span className="text-xs text-red-600 font-medium">{uploaded.error}</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(uploaded.id)
                  }}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUpload
