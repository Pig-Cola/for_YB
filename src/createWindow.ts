import { BrowserWindow, Menu } from 'electron'
import path from 'node:path'

const isDev = process.argv[2] === 'dev'

export const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow( {
    height: 640,
    width: 1080,
    webPreferences: {
      // preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      preload: path.join( __dirname, 'preload.js' ),
      contextIsolation: false,
      nodeIntegration: true,
    },
    minWidth: 800,
    minHeight: 500,
    icon: './src/icon.ico',
  } )

  // and load the index.html of the app.
  // mainWindow.loadURL( MAIN_WINDOW_WEBPACK_ENTRY )

  if ( MAIN_WINDOW_VITE_DEV_SERVER_URL ) {
    mainWindow.loadURL( MAIN_WINDOW_VITE_DEV_SERVER_URL )
  } else {
    mainWindow.loadFile( path.join( __dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html` ) )
  }

  const menu = Menu.buildFromTemplate( [
    {
      label: '옵션',
      accelerator: 'alt + f',
      submenu: [
        { role: 'reload', label: '새로고추장무침', accelerator: 'ctrl + shift + r' },
        {
          label: 'zoom',
          submenu: [
            { role: 'zoomIn', label: '키워줘', accelerator: 'ctrl + =' },
            { role: 'zoomOut', label: '줄여줘' },
            { role: 'resetZoom', label: '초기화' },
          ],
        },
        { role: 'togglefullscreen', label: '전체화면' },
        {
          label: '종료',
          accelerator: 'ctrl + shift + w',
          click( menuItem, browserWindow ) {
            browserWindow.close()
          },
        },

        ...( isDev ? [{ role: 'toggleDevTools' } as const] : [] ),
      ],
    },
  ] )
  mainWindow.center()
  mainWindow.setMenu( menu )
  mainWindow.setAutoHideMenuBar( true )

  mainWindow.webContents.session.addListener( 'will-download', ( e, item ) => {
    item.setSaveDialogOptions( { title: '다른 이름으로 저장' } )
  } )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  return mainWindow
}
