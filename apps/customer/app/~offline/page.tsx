export default function OfflinePage() {
  return (
    <main className="customer-page-enter flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground">You are offline</p>
      <h1 className="text-2xl font-semibold tracking-tight">No connection</h1>
      <p className="max-w-sm text-muted-foreground">
        Check your internet connection and try again. Your cart is saved on this
        device.
      </p>
    </main>
  );
}
