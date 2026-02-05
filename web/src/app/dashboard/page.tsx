import { auth } from '@/auth'

export default async function DashboardPage() {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido, {user?.name}</h2>
            <p className="text-slate-500 max-w-md">
                Selecciona una opción del menú o espera a que se cargue tu panel de control.
            </p>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
                <p className="font-mono text-sm text-slate-400">Rol detectado: <span className="text-slate-700 font-semibold">{user?.role}</span></p>
            </div>
        </div>
    )
}
