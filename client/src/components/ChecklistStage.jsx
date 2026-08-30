import React from "react";

export default function ChecklistStage({
  eyebrow,
  title,
  hint,
  items,
  renderDetail,
  actionLabel,
  onConfirm,
}) {
  return (
    <div className="stage">
      <div className="stage__eyebrow">{eyebrow}</div>
      <h1 className="stage__title">{title}</h1>
      <p className="stage__hint">{hint}</p>

      {items.map((item) => (
        <div key={item.id} className={`item ${item.confirmed ? "is-confirmed" : ""}`}>
          <div className="item__indicator">{item.confirmed ? "✓" : ""}</div>
          <div className="item__body">
            <div className="item__label">
              {item.id && item.id.startsWith("T") && <span className="item__id">{item.id}</span>}
              {item.label || item.type}
            </div>
            {renderDetail && <div className="item__detail">{renderDetail(item)}</div>}
          </div>
          <button
            className="btn btn--confirm"
            disabled={item.confirmed}
            onClick={() => onConfirm(item.id)}
          >
            {item.confirmed ? "Confirmed" : actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
