import { TrustSectionConfig } from "@/lib/content-db";

interface TrustSectionProps {
  config: TrustSectionConfig;
}

export default function TrustSection({ config }: TrustSectionProps) {
  // If the admin turned off this section, completely remove it from the page
  if (!config || !config.enabled) {
    return null;
  }

  return (
    <section className="trust">
      <div className="wrap">
        <div className="trust-head reveal">
          <div className="section-label">{config.eyebrow}</div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {config.heading}
          </h2>
          <p>{config.description}</p>
        </div>

        <div className="trust-slots reveal">
          {config.slots.map((slot) => {
            const isClear = slot.bgStyle === "clear";
            const isWhite = slot.bgStyle === "white";
            const isMint = slot.bgStyle === "mint" || (!slot.bgStyle && slot.isHighlighted);

            let bgClass = "";
            if (isClear) {
              bgClass = "trust-slot-clear";
            } else if (isWhite) {
              bgClass = "trust-slot-white";
            } else if (isMint) {
              bgClass = "first";
            }

            const isPlaceholder = !slot.logo && (
              !slot.label ||
              slot.label === "—" ||
              slot.label.toLowerCase().includes("your logo")
            );

            return (
              <div
                key={slot.id}
                className={`trust-slot ${bgClass}`}
              >
                {slot.logo ? (
                  <div className="trust-slot-combo">
                    <div className="trust-slot-logo-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slot.logo}
                        alt={slot.label || "Client logo"}
                        className="trust-slot-logo-img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    {slot.label && slot.label.trim() !== "" && (
                      <div className="trust-slot-name">
                        {slot.label.split("\n").map((line, idx, arr) => (
                          <span key={idx}>
                            {line}
                            {idx < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : isPlaceholder ? (
                  <div className="trust-slot-placeholder">
                    {slot.label === "—" ? (
                      <span className="trust-slot-dash">—</span>
                    ) : (
                      <span className="trust-slot-invite">
                        {(slot.label || "Your logo\ncould go here").split("\n").map((line, idx, arr) => (
                          <span key={idx}>
                            {line}
                            {idx < arr.length - 1 && <br />}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="trust-slot-brand-text">
                    {(slot.label || "").split("\n").map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
