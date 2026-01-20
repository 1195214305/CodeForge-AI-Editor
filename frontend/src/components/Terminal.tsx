/**
 * XTerm.js 终端组件
 * 提供命令行交互界面（模拟）
 */

import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'
import { useEditorStore } from '../store/editorStore'
import { Terminal as TerminalIcon, X, Trash2 } from 'lucide-react'

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const { terminalOpen, toggleTerminal, addTerminalHistory, clearTerminalHistory } = useEditorStore()

  useEffect(() => {
    if (!terminalRef.current || !terminalOpen) return

    // 创建终端实例
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#0a0a0f',
        foreground: '#00e5cc',
        cursor: '#ff6b35',
        black: '#0a0a0f',
        red: '#ff006e',
        green: '#00e5cc',
        yellow: '#ffbe0b',
        blue: '#00e5cc',
        magenta: '#ff006e',
        cyan: '#00e5cc',
        white: '#e0e0e0',
        brightBlack: '#2a2a3a',
        brightRed: '#ff006e',
        brightGreen: '#00e5cc',
        brightYellow: '#ffbe0b',
        brightBlue: '#00e5cc',
        brightMagenta: '#ff006e',
        brightCyan: '#00e5cc',
        brightWhite: '#ffffff'
      },
      allowProposedApi: true
    })

    // 添加适配器
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    // 尝试加载 WebGL 加速
    try {
      const webglAddon = new WebglAddon()
      term.loadAddon(webglAddon)
    } catch (e) {
      console.warn('WebGL addon 加载失败，使用 Canvas 渲染')
    }

    // 挂载终端
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // 欢迎信息
    term.writeln('\x1b[1;36m╔═══════════════════════════════════════════════════════╗\x1b[0m')
    term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;33mCodeForge Terminal\x1b[0m - 基于 ESA Pages 的边缘终端  \x1b[1;36m║\x1b[0m')
    term.writeln('\x1b[1;36m╚═══════════════════════════════════════════════════════╝\x1b[0m')
    term.writeln('')
    term.writeln('\x1b[32m提示: 这是一个模拟终端，支持基本命令\x1b[0m')
    term.writeln('\x1b[90m可用命令: help, clear, ls, pwd, echo, date\x1b[0m')
    term.writeln('')
    term.write('\x1b[1;35m$\x1b[0m ')

    let commandBuffer = ''

    // 处理用户输入
    term.onData((data) => {
      const code = data.charCodeAt(0)

      // 回车键
      if (code === 13) {
        term.writeln('')
        const command = commandBuffer.trim()

        if (command) {
          executeCommand(term, command)
          addTerminalHistory(command, '')
        }

        commandBuffer = ''
        term.write('\x1b[1;35m$\x1b[0m ')
      }
      // 退格键
      else if (code === 127) {
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1)
          term.write('\b \b')
        }
      }
      // Ctrl+C
      else if (code === 3) {
        term.writeln('^C')
        commandBuffer = ''
        term.write('\x1b[1;35m$\x1b[0m ')
      }
      // 普通字符
      else if (code >= 32 && code < 127) {
        commandBuffer += data
        term.write(data)
      }
    })

    // 窗口大小调整
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [terminalOpen])

  // 执行命令
  const executeCommand = (term: XTerm, command: string) => {
    const [cmd, ...args] = command.split(' ')

    switch (cmd.toLowerCase()) {
      case 'help':
        term.writeln('\x1b[1;33m可用命令:\x1b[0m')
        term.writeln('  \x1b[36mhelp\x1b[0m     - 显示帮助信息')
        term.writeln('  \x1b[36mclear\x1b[0m    - 清空终端')
        term.writeln('  \x1b[36mls\x1b[0m       - 列出文件')
        term.writeln('  \x1b[36mpwd\x1b[0m      - 显示当前目录')
        term.writeln('  \x1b[36mecho\x1b[0m     - 输出文本')
        term.writeln('  \x1b[36mdate\x1b[0m     - 显示当前时间')
        break

      case 'clear':
        term.clear()
        break

      case 'ls':
        term.writeln('\x1b[34mworkspace/\x1b[0m')
        term.writeln('  welcome.md')
        term.writeln('  example.js')
        break

      case 'pwd':
        term.writeln('/workspace')
        break

      case 'echo':
        term.writeln(args.join(' '))
        break

      case 'date':
        term.writeln(new Date().toLocaleString('zh-CN'))
        break

      default:
        term.writeln(`\x1b[31m命令未找到: ${cmd}\x1b[0m`)
        term.writeln('\x1b[90m输入 "help" 查看可用命令\x1b[0m')
    }
  }

  if (!terminalOpen) return null

  return (
    <div className="h-64 bg-dark-bg border-t border-dark-border flex flex-col">
      {/* 终端头部 */}
      <div className="h-10 bg-dark-surface flex items-center justify-between px-4 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-cyber-cyan" />
          <span className="text-sm text-gray-300 font-medium">终端</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminalHistory}
            className="p-1.5 hover:bg-dark-bg rounded transition-colors"
            title="清空历史"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-cyber-orange" />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1.5 hover:bg-dark-bg rounded transition-colors"
            title="关闭终端"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-cyber-orange" />
          </button>
        </div>
      </div>

      {/* XTerm 终端 */}
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  )
}
