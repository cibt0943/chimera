export function Spinner() {
  return (
    <div className="flex justify-center" aria-label="読み込み中">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-800 border-t-transparent"></div>
    </div>
  )
}
