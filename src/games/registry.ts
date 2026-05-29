import type { ComponentType } from 'react'
import { TrustMeItsVscode } from './trust-me-its-vscode'
import { Backrooms } from './backrooms'

export type Game = {
  id: string
  displayName: string
  fileName: string
  folderName: string
  component: ComponentType
}

export const gameRegistry: Game[] = [
  {
    id: 'trust-me-its-vscode',
    displayName: 'vscode맞습니다 믿어주세요',
    fileName: 'async-void.executor.ts',
    folderName: 'trust-me-its-vscode',
    component: TrustMeItsVscode,
  },
  {
    id: 'backrooms',
    displayName: '백룸',
    fileName: 'backrooms.tsx',
    folderName: 'backrooms',
    component: Backrooms,
  },
]
