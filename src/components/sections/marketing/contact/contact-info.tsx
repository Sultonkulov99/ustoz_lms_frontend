
import { Phone, Mail, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Telefon",
    value: "+998 99 999 99 99",
  },
  {
    icon: Mail,
    label: "Elektron pochta",
    value: "info@researchbridge.uz",
  },
  {
    icon: MapPin,
    label: "Manzil",
    value: "Manzil shu yerda kiritiladi",
  },
];

export function ContactInfo() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:pt-16">
      <p className="text-sm font-bold uppercase tracking-wider text-primary">
        Bog&apos;lanish
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Savollaringiz bo&apos;lsa murojaat qiling
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {contactInfo.map((item) => (
          <div
            key={item.label}
            className="group rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-8"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105 sm:size-16">
              <item.icon className="size-7 sm:size-8" />
            </div>

            <p className="mt-5 text-lg font-bold text-foreground sm:text-xl">
              {item.label}
            </p>
            <p className="mt-1.5 text-base font-medium text-muted-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}