const PageHeader = ({ eyebrow = "Super Admin", title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-[.12em] text-blue-400">{eyebrow}</p>
      <h1 className="text-[28px] font-semibold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);
export default PageHeader;
