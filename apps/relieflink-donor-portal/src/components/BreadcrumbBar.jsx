import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function BreadcrumbBar({
  backTo = "/donor",
  backLabel = "Relief Map",
  current,
  subtitle,
  actions,
  category,
}) {
  const navigate = useNavigate();

  const handleBack = (e) => {
    if (backTo) return; // use normal Link
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="mb-6 border-b border-line pb-4 transition-all duration-200">
      {/* Top back navigation + breadcrumb path */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs">
          {backTo ? (
            <Link
              to={backTo}
              className="group inline-flex items-center gap-1.5 font-medium text-body-soft hover:text-ink transition-colors px-2 py-1 rounded-lg hover:bg-paper-dim"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-action" />
              <span>Back to {backLabel}</span>
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-1.5 font-medium text-body-soft hover:text-ink transition-colors px-2 py-1 rounded-lg hover:bg-paper-dim"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-action" />
              <span>Back</span>
            </button>
          )}

          <ChevronRight className="h-3 w-3 text-line-dark/30 shrink-0" />
          <span className="font-semibold text-ink truncate">{current}</span>

          {category && (
            <span className="hidden sm:inline-flex items-center rounded-md bg-paper-dim px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-body-soft">
              {category}
            </span>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Main title & optional subtitle */}
      <div className="mt-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {current}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-body-soft max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
