import type { GetServerSidePropsContext } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * @link https://next-auth.js.org/configuration/nextjs
 **/
export const getUnstableSession = async (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions)
}
