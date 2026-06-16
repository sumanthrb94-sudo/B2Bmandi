// Legacy seller hub — sellers are now managed via Admin. Passthrough layout;
// each page redirects to the unified app.
export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
