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
          {config.slots.map((slot) => (
            <div
              key={slot.id}
              className={`trust-slot ${slot.isHighlighted ? "first" : ""}`}
            >
              <span>
                {slot.label.split("\n").map((line, idx, arr) => (
                  <span key={idx}>
                    {line}
                    {idx < arr.length - 1 && <br />}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
