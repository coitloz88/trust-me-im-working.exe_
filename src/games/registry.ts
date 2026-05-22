import type { ComponentType } from 'react'
import { TrustMeItsVscode } from './trust-me-its-vscode'

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
    fileName: 'oauth.service.ts',
    folderName: 'trust-me-its-vscode',
    component: TrustMeItsVscode,
  },
]
