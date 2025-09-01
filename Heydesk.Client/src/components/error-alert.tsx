
export default function ErrorAlert({ errors }: { errors: string[] }) {
  return (
    <div className="rounded-md border px-3 py-3">
        <div className="grow space-y-1">
          <ul className="text-destructive list-disc text-xs ml-4">
            {errors.map((error, i) => (
              <li key={i} className="pl-1">{error}</li>
            ))}
          </ul>
        </div>
    </div>
  );
}
