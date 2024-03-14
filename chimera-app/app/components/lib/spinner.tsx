export function Spinner() {
  return (
    <div className="flex justify-center" aria-label="読み込み中">
      <div className="animate-spin h-6 w-6 border-4 border-slate-800 rounded-full border-t-transparent"></div>
    </div>
  )
}
