import { appDirectoryName, fileEncoding } from '@shared/constants'
import { NoteInfo } from '@shared/models'
import { CreateNote, DeleteNote, GetNotes, WriteNote } from '@shared/types'
import { dialog } from 'electron'
import { ensureDir, readFile, readdir, remove, stat, writeFile } from 'fs-extra'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
import welcomeNoteFilename from '../../../resources/welcome.md?asset'

export const getRootDir = () => {
  return `${homedir()}\\${appDirectoryName}`
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()
  console.log('rootDir:', rootDir)
  await ensureDir(rootDir)

  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))
  if (isEmpty(notes)) {
    console.info('No notes found,creating a welcome note')

    const content = await readFile(welcomeNoteFilename, { encoding: fileEncoding })

    await writeFile(`${rootDir}/welcome.md`, content, { encoding: fileEncoding })

    notes.push('Welcome.md')
  }
  return Promise.all(notes.map(getNoteinfoFromFIleName))
}

export const getNoteinfoFromFIleName = async (fileName: string): Promise<NoteInfo> => {
  const fileStats = await stat(`${getRootDir()}/${fileName}`)

  return {
    title: fileName.replace(/\.md$/, ''),
    lastEditTime: fileStats.mtimeMs
  }
}

export const readNote = async (fileName: string) => {
  const rootDir = getRootDir()

  return readFile(`${rootDir}/${fileName}.md`, { encoding: fileEncoding })
}

export const writeNote: WriteNote = async (filename, content) => {
  const rootDir = getRootDir()

  console.info(`Writing nonte ${filename}`)

  return writeFile(`${rootDir}/${filename}.md`, content, { encoding: fileEncoding })
}

export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()
  console.log(rootDir)
  await ensureDir(rootDir)

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: '新建笔记',
    defaultPath: `${rootDir}/Untitled.md`,
    buttonLabel: '创建',
    properties: ['showOverwriteConfirmation'],
    showsTagField: false,
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (!filePath || canceled) {
    console.info('Note creation cancelled')
    return false
  }

  const { name: filename, dir: parentDir } = path.parse(filePath)

  console.log('parentDir:', parentDir)
  if (parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: '创建失败',
      message: '请在根目录下创建笔记!'
    })

    return false
  }

  console.info(`创建笔记: ${filename}`)
  await writeFile(filePath, '')

  return filename
}

export const deleteNote: DeleteNote = async (filename) => {
  const rootDir = getRootDir()
  await ensureDir(rootDir)

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: '删除确认',
    message: `确认删除 "${filename}" 笔记吗？`,
    buttons: ['确认', '取消'],
    defaultId: 1,
    cancelId: 1
  })

  if (response === 1) {
    console.info('删除取消')
    return false
  }

  console.info(`成功删除:${filename}`)

  await remove(`${rootDir}/${filename}.md`)

  return true
}
