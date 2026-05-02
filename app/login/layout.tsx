export const metadata = {
  title: 'Login - SUMINI-DIMSUM',
  description: 'Halaman Login SUMINI-DIMSUM',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {children}
    </div>
  )
}
