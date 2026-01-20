/**
 * 文件浏览器组件
 * 虚拟文件系统管理
 */

import { useState } from 'react'
import { useEditorStore, FileNode } from '../store/editorStore'
import {
  Folder,
  FolderOpen,
  File,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

export default function FileExplorer() {
  const { files, currentFile, setCurrentFile, addFile, deleteFile, fileExplorerOpen } = useEditorStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file')
  const [selectedFolder, setSelectedFolder] = useState('/')

  if (!fileExplorerOpen) return null

  // 切换文件夹展开状态
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  // 处理文件点击
  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setCurrentFile(file)
    } else {
      toggleFolder(file.path)
    }
  }

  // 创建新文件/文件夹
  const handleCreateNew = () => {
    if (newFileName.trim()) {
      addFile(selectedFolder, newFileName.trim(), newFileType)
      setNewFileName('')
      setShowNewFileDialog(false)
    }
  }

  // 渲染文件树节点
  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = currentFile?.path === node.path
    const isFolder = node.type === 'folder'

    return (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 px-2 py-1.5 cursor-pointer hover:bg-dark-surface transition-colors ${
            isSelected ? 'bg-dark-surface border-l-2 border-cyber-cyan' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {isFolder && (
            <span className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-cyber-yellow" />
            ) : (
              <Folder className="w-4 h-4 text-cyber-yellow" />
            )
          ) : (
            <File className="w-4 h-4 text-cyber-cyan" />
          )}
          <span className={`text-sm flex-1 ${isSelected ? 'text-cyber-cyan font-medium' : 'text-gray-300'}`}>
            {node.name}
          </span>
          {node.path !== '/' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`确定删除 ${node.name}?`)) {
                  deleteFile(node.path)
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-bg rounded"
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-cyber-orange" />
            </button>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-dark-bg border-r border-dark-border flex flex-col">
      {/* 文件浏览器头部 */}
      <div className="h-12 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4">
        <span className="text-sm text-gray-300 font-medium">文件浏览器</span>
        <button
          onClick={() => {
            setSelectedFolder('/')
            setShowNewFileDialog(true)
          }}
          className="p-1.5 hover:bg-dark-bg rounded transition-colors"
          title="新建文件"
        >
          <Plus className="w-4 h-4 text-cyber-cyan" />
        </button>
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto">
        {files.map((node) => renderFileNode(node))}
      </div>

      {/* 新建文件对话框 */}
      {showNewFileDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-cyber-cyan rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-medium text-cyber-cyan">新建文件/文件夹</h3>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">类型</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newFileType === 'file'}
                    onChange={() => setNewFileType('file')}
                    className="text-cyber-cyan"
                  />
                  <span className="text-gray-300">文件</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newFileType === 'folder'}
                    onChange={() => setNewFileType('folder')}
                    className="text-cyber-cyan"
                  />
                  <span className="text-gray-300">文件夹</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">名称</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                placeholder={newFileType === 'file' ? 'example.js' : 'folder-name'}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-gray-300 focus:border-cyber-cyan focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewFileDialog(false)
                  setNewFileName('')
                }}
                className="px-4 py-2 bg-dark-bg text-gray-300 rounded hover:bg-dark-border transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-cyber-cyan text-dark-bg rounded hover:bg-cyber-orange transition-colors font-medium"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
