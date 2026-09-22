type Props = {
  items: { id: string; content: React.ReactNode }[];
  className?: string;
};

export function LegalBulletList({
  items,
  className = "space-y-2 text-gray-600 dark:text-gray-300",
}: Props) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start">
          <span className="text-indigo-600 dark:text-indigo-400 mr-3" aria-hidden="true">
            •
          </span>
          <span>{item.content}</span>
        </li>
      ))}
    </ul>
  );
}
