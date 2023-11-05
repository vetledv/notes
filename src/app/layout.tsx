import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'

import { TRPCReactProvider } from '~/trpc/react'

import '../styles/globals.css'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-sans'
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className={`font-sans ${inter.variable}`}>
				<TRPCReactProvider cookies={cookies().toString()}>{children}</TRPCReactProvider>
			</body>
		</html>
	)
}
