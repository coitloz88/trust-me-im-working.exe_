const DECOY_CODE = `import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { config } from '../config'
import { logger } from '../utils/logger'
import { UnauthorizedError } from '../errors'

const ACCESS_TOKEN_TTL = 60 * 15
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7

export interface TokenPayload {
  sub: string
  email: string
  roles: string[]
  iat: number
  exp: number
}

export function signAccessToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: 'HS256',
    issuer: config.jwt.issuer,
  })
}

export function signRefreshToken(sub: string): string {
  return jwt.sign({ sub }, config.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL,
    algorithm: 'HS256',
  })
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
    }) as TokenPayload
  } catch (err) {
    logger.warn({ err }, 'access token verification failed')
    throw new UnauthorizedError('invalid token')
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing authorization header' })
  }

  const token = header.slice('Bearer '.length)
  try {
    req.user = verifyAccessToken(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
`

const LINES = DECOY_CODE.split('\n')

export function DecoyEditor() {
  return (
    <div className="editor">
      <div className="editor__gutter">
        {LINES.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="editor__content">
        {LINES.map((line, i) => (
          <div key={i}>{line || ' '}</div>
        ))}
      </div>
    </div>
  )
}
