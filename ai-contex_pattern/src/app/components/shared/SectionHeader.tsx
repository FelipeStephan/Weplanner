export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-[#171717] dark:text-white">
        {title}
      </h2>
      <p className="text-xs text-[#a3a3a3] dark:text-[#737373] mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}
