import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CookingPot,
  Disc,
  Flame,
  Leaf,
  Salad,
  Search,
  Soup,
  Sparkles,
  Star,
  Utensils,
  UtensilsCrossed,
  Wheat,
  Wine,
  X,
} from 'lucide-react'
import homeImg from './assets/home.png'
import { DIET_META, DRINKS, FOOD, type Category, type Diet, type Item, type Price } from './menu'

const IMG = {
  hero: homeImg,
  food: 'https://images.unsplash.com/photo-1789990642068-0840cf55e1cf?w=900&h=500&fit=crop&auto=format',
  bar: 'https://images.unsplash.com/photo-1778104960251-b1d82ac92ee9?w=900&h=500&fit=crop&auto=format',
}

const CATEGORY_PHOTO: Record<string, { src: string; alt: string; tag: string }> = {
  'soup': { src: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&h=500&fit=crop&auto=format', alt: 'Bowl of steaming soup', tag: 'Served piping hot' },
  'starter': { src: 'https://images.unsplash.com/photo-1666001120694-3ebe8fd207be?w=900&h=500&fit=crop&auto=format', alt: 'Plate of grilled paneer tikka starters', tag: 'Small plates to share' },
  'tandoor-se': { src: 'https://images.unsplash.com/photo-1705359573325-f2006d5e459f?w=900&h=500&fit=crop&auto=format', alt: 'Chicken and vegetable skewers on the grill', tag: 'Straight from the clay oven' },
  'main-course': { src: 'https://images.unsplash.com/photo-1789990642068-0840cf55e1cf?w=900&h=500&fit=crop&auto=format', alt: 'Metal bowl of curry with fried bread', tag: 'Made for sharing' },
  'roti-ka-khazana': { src: 'https://images.unsplash.com/photo-1697155406014-04dc649b0953?w=900&h=500&fit=crop&auto=format', alt: 'Bowl of fresh naan bread', tag: 'Fresh from the tandoor' },
  'basmati-ki-bahar': { src: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=900&h=500&fit=crop&auto=format', alt: 'Bowl of biryani rice with meat', tag: 'Slow-dum biryani' },
  'chinese-ka-tadka': { src: 'https://images.unsplash.com/photo-1603496987351-f84a3ba5ec85?w=900&h=500&fit=crop&auto=format', alt: 'Indo-Chinese chilli chicken with peppers', tag: 'Wok-fired favourites' },
  'chinese-rice-noodles': { src: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900&h=500&fit=crop&auto=format', alt: 'Stir-fried noodles with vegetables', tag: 'Wok-tossed classics' },
  'khane-ke-saath': { src: 'https://images.unsplash.com/photo-1635704181144-d44f380e623c?w=900&h=500&fit=crop&auto=format', alt: 'Wooden bowl of salad and accompaniments', tag: 'Fresh on the side' },
}

const ICONS: Record<string, typeof Soup> = {
  soup: Soup,
  salad: Salad,
  flame: Flame,
  pot: CookingPot,
  disc: Disc,
  wheat: Wheat,
  sparkles: Sparkles,
  utensils: Utensils,
  leaf: Leaf,
}

/* ---------- hash routing ---------- */
function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
const go = (path: string) => {
  window.location.hash = '/' + path
}

/* ---------- shared bits ---------- */
function Diamonds() {
  return (
    <div className="flex justify-between px-1 py-4 text-[#f0cdb8]" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="block size-2 rotate-45 bg-current" />
      ))}
    </div>
  )
}

function Brand({ small }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 text-clay">
        <span className="h-px w-8 bg-clay/60" />
        <Sparkles className="size-3.5" fill="currentColor" strokeWidth={0} />
        <span className="h-px w-8 bg-clay/60" />
      </div>
      <span className={`font-display leading-none ${small ? 'mt-1 text-[28px]' : 'text-4xl'}`}>Sahyadri</span>
    </div>
  )
}

function RoundBtn({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card text-ink transition hover:bg-blush active:scale-95"
    >
      {children}
    </button>
  )
}

function Header({
  onBack,
  searching,
  onSearch,
}: {
  onBack: () => void
  searching?: boolean
  onSearch?: () => void
}) {
  return (
    <div className="flex items-center justify-between pt-5">
      <RoundBtn label="Back" onClick={onBack}>
        <ArrowLeft className="size-[18px]" strokeWidth={1.5} />
      </RoundBtn>
      <Brand small />
      {onSearch ? (
        <RoundBtn label={searching ? 'Close search' : 'Search'} onClick={onSearch}>
          {searching ? <X className="size-[18px]" strokeWidth={1.5} /> : <Search className="size-[18px]" strokeWidth={1.5} />}
        </RoundBtn>
      ) : (
        <span className="size-10" />
      )}
    </div>
  )
}

function Title({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="pt-5 text-center">
      <h1 className="font-display text-[44px] leading-none font-medium">{title}</h1>
      <p className="mt-2 text-[13px] text-faint">{sub}</p>
    </div>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search this menu"
      className="mt-4 w-full rounded-full border border-line bg-card px-5 py-3 text-sm outline-none placeholder:text-faint"
    />
  )
}

function PriceView({ prices }: { prices: Price[] | null }) {
  if (!prices)
    return (
      <span className="text-[15px] font-medium tabular-nums" title="As per size">
        APS
      </span>
    )
  if (prices.length === 1 && !prices[0].label)
    return <span className="text-[15px] font-medium tabular-nums">₹{prices[0].value}</span>
  return (
    <div className="flex flex-col items-end gap-0.5">
      {prices.map((p, i) => (
        <span key={i} className="text-[13px] font-medium whitespace-nowrap tabular-nums">
          {p.label && <span className="mr-1.5 text-[11px] font-normal text-faint">{p.label}</span>}₹{p.value}
        </span>
      ))}
    </div>
  )
}

function DietMark({ diet }: { diet: Diet }) {
  const c = DIET_META[diet].color
  return (
    <span
      role="img"
      aria-label={DIET_META[diet].title}
      className="mt-[3px] grid size-[15px] shrink-0 place-items-center rounded-[3px] border-[1.5px]"
      style={{ borderColor: c }}
    >
      <span className="size-[7px] rounded-full" style={{ background: c }} />
    </span>
  )
}

function ChefTag() {
  return <span className="text-clay"> · Chef’s pick</span>
}

function FoodRow({ item }: { item: Item }) {
  return (
    <li className="flex items-start gap-3 border-b border-line py-3.5 last:border-b-0">
      <DietMark diet={item.diet} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug font-medium">
          {item.name}
          {item.chef && <ChefTag />}
        </p>
        {item.desc && <p className="mt-0.5 text-[12.5px] leading-snug text-faint">{item.desc}</p>}
      </div>
      <div className="pt-px text-right">
        <PriceView prices={item.prices} />
      </div>
    </li>
  )
}

function SectionHead({ title, tagline, color }: { title: string; tagline: string; color: string }) {
  return (
    <div className="flex gap-3 pt-8 pb-1">
      <span className="w-[3px] rounded-full" style={{ background: color }} />
      <div>
        <h2 className="font-display text-[28px] leading-none font-medium">{title}</h2>
        <p className="mt-1.5 text-xs text-faint">{tagline}</p>
      </div>
    </div>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-10 rounded-2xl bg-blush p-4">
      <p className="text-xs font-semibold text-clay-deep">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-soft">{children}</p>
    </div>
  )
}

const REVIEW_URL = 'https://local.google.com/place?placeid=ChIJPbIxVbiv5zsREaOLPWd9xlE&utm_medium=noren&utm_source=gbp&utm_campaign=2026'

function ReviewButton() {
  return (
    <a
      href={REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-[20px] border border-line bg-card p-3.5 transition hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush">
        <Star className="size-5 text-[#e0a03a]" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="flex-1">
        <span className="flex gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 text-[#e0a03a]" fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span className="block text-[14px] font-semibold">Enjoyed your meal? Rate us on Google</span>
        <span className="block text-[11.5px] text-faint">Your review helps our family kitchen</span>
      </span>
      <ArrowUpRight className="size-5 text-clay transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.4} />
    </a>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-12">
      {children}
      <footer className="mt-8 space-y-4">
        <ReviewButton />
        <ContactInfo />
      </footer>
    </div>
  )
}

function Photo({ src, alt, tag, className = '', imgClass = 'object-center' }: { src: string; alt: string; tag?: string; className?: string; imgClass?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-[#4a3a2e] ${className}`}>
      <img src={src} alt={alt} className={`size-full object-cover ${imgClass}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {tag && (
        <span className="absolute bottom-3.5 left-4 text-[10px] font-medium tracking-[0.14em] text-white uppercase">
          {tag}
        </span>
      )}
    </div>
  )
}

function ContactInfo() {
  return (
    <div className="mt-8 border-t border-line pt-6 text-center text-[12.5px] leading-relaxed text-faint">
      <p className="font-medium text-soft">Contact: +91 81492 81145</p>
      <p className="mt-1">Address:</p>
      <p>Shop No. 5, Pereira Shopping Center, Sweet Sahara Complex,</p>
      <p>6, 7, St. Mary&apos;s Road, Pereira Nagar, Naigaon East,</p>
      <p>Sarjamori, Vasai-Virar, Maharashtra 401208, India.</p>
      <p className="mt-1">Coordinates: 19.3606249, 72.8460223</p>
    </div>
  )
}

/* ---------- pages ---------- */
function Landing() {
  const links = [
    { kicker: 'Explore the kitchen', label: 'Food Menu', to: 'food', icon: <UtensilsCrossed className="size-5" strokeWidth={1.4} /> },
    { kicker: 'From our bar', label: 'Drink Menu', to: 'drinks', icon: <Wine className="size-5" strokeWidth={1.4} /> },
  ]
  return (
    <Shell>
      <div className="rise pt-10">
        <div className="flex items-center gap-2 text-clay">
          <span className="h-px w-10 bg-clay/60" />
          <Sparkles className="size-4" fill="currentColor" strokeWidth={0} />
          <span className="h-px w-10 bg-clay/60" />
        </div>
        <h1 className="mt-4 font-display text-[44px] leading-none font-medium">Sahyadri</h1>
        <p className="mt-1.5 text-[11px] font-medium tracking-[0.1em] text-clay uppercase">Family Restaurant &amp; Bar</p>
        <Photo src={IMG.hero} alt="Sahyadri dining hall with teal banquettes and long laid tables" tag="Naigaon · Palghar" className="mt-6 h-[260px]" imgClass="object-[50%_62%]" />
        <h2 className="mt-8 text-center font-display text-[34px] leading-none font-medium">Welcome to our table</h2>
        <p className="mx-auto mt-3 max-w-[300px] text-center text-[13px] leading-relaxed text-soft">
          Season-led Indian cooking, familiar flavours and a little theatre.
        </p>
        <div className="mt-6 space-y-3">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className="group flex w-full items-center gap-4 rounded-[20px] border border-line bg-card p-3.5 pr-5 text-left shadow-[0_8px_24px_-14px_rgba(80,50,20,0.35)] transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <span className="grid size-12 place-items-center rounded-full bg-blush text-clay">{l.icon}</span>
              <span className="flex-1">
                <span className="block text-[10px] font-semibold tracking-[0.1em] text-faint uppercase">{l.kicker}</span>
                <span className="block font-display text-[28px] leading-tight">{l.label}</span>
              </span>
              <ArrowUpRight className="size-5 text-clay transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.4} />
            </button>
          ))}
        </div>
        <Diamonds />
      </div>
    </Shell>
  )
}

function CategoryIndex() {
  return (
    <Shell>
      <div className="rise">
        <Header onBack={() => go('')} />
        <Title title="Food Menu" sub="Choose a chapter from our kitchen" />
        <Diamonds />
        <ul className="overflow-hidden rounded-[24px] border border-line bg-card">
          {FOOD.map((c) => {
            const Icon = ICONS[c.icon]
            return (
              <li key={c.slug} className="border-b border-line last:border-b-0">
                <button
                  onClick={() => go(`food/${c.slug}`)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-blush/50 active:bg-blush"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush text-clay">
                    <Icon className="size-[18px]" strokeWidth={1.4} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-[22px] leading-tight">{c.title}</span>
                    <span className="block text-[11.5px] text-faint">{c.tagline}</span>
                  </span>
                  <ChevronRight className="size-4 text-faint" />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-5 flex items-center gap-2 text-xs text-faint">
          <span className="block size-1.5 rotate-45 bg-[#e0a03a]" />
          Please tell your server about allergies or dietary preferences.
        </p>
      </div>
    </Shell>
  )
}

function matches(text: string, q: string) {
  return text.toLowerCase().includes(q.trim().toLowerCase())
}

function FoodListing({ category }: { category: Category }) {
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const groups = useMemo(
    () =>
      category.groups
        .map((g) => ({ ...g, items: q.trim() ? g.items.filter((i) => matches(i.name + (i.desc ?? ''), q)) : g.items }))
        .filter((g) => g.items.length),
    [category, q],
  )
  const showHeads = category.groups.length > 1

  return (
    <Shell>
      <div className="rise">
        <Header
          onBack={() => go('food')}
          searching={searching}
          onSearch={() => {
            setSearching((s) => !s)
            setQ('')
          }}
        />
        <Title title={category.title} sub={category.tagline} />
        {searching && <SearchBar value={q} onChange={setQ} />}
        {!searching && CATEGORY_PHOTO[category.slug] && (
          <Photo {...CATEGORY_PHOTO[category.slug]} className="mt-5 h-[170px] !rounded-[24px]" />
        )}
        <Diamonds />
        {groups.map((g) => (
          <section key={g.diet}>
            {showHeads && <SectionHead title={g.title} tagline={g.tagline} color={DIET_META[g.diet].color} />}
            <ul>
              {g.items.map((item, i) => (
                <FoodRow key={item.name + i} item={item} />
              ))}
            </ul>
          </section>
        ))}
        {!groups.length && <p className="py-10 text-center text-sm text-faint">Nothing matches “{q}”.</p>}
        <Note title="A note from our kitchen">
          Prices are in ₹. APS means as per size — please ask your server. Most dishes can be adjusted for heat; tell us about nuts, dairy, gluten or other allergens.
        </Note>
      </div>
    </Shell>
  )
}

function DrinksMenu() {
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const sections = DRINKS.map((s) => ({
    ...s,
    items: q.trim() ? s.items.filter((i) => matches(i.name + i.desc, q)) : s.items,
  })).filter((s) => s.items.length)

  return (
    <Shell>
      <div className="rise">
        <Header
          onBack={() => go('')}
          searching={searching}
          onSearch={() => {
            setSearching((s) => !s)
            setQ('')
          }}
        />
        <Title title="Drinks Menu" sub="Cocktails, fine pours and zero-proof refreshments" />
        {searching ? (
          <SearchBar value={q} onChange={setQ} />
        ) : (
          <div className="relative mt-5">
            <Photo src={IMG.bar} alt="Amber cocktail with orange peel on the bar" className="h-[130px] !rounded-[24px]" />
            <span className="absolute top-3 right-3 rounded-full bg-card px-2.5 py-1 text-[10px] font-medium tracking-wider text-[#7a2e2e] uppercase">
              Bar original
            </span>
          </div>
        )}
        <Diamonds />
        {sections.map((s) => (
          <section key={s.slug}>
            <SectionHead title={s.title} tagline={s.tagline} color={s.tone === 'green' ? 'var(--diet-veg)' : 'var(--diet-mutton)'} />
            <ul>
              {s.items.map((i) => (
                <li key={i.name} className="flex items-start justify-between gap-4 border-b border-line py-3.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-[15px] leading-snug font-medium">
                      {i.name}
                      {i.chef && <ChefTag />}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-faint">{i.desc}</p>
                  </div>
                  <span className="text-[15px] font-medium tabular-nums">₹{i.price}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!sections.length && <p className="py-10 text-center text-sm text-faint">Nothing matches “{q}”.</p>}
        <Note title="Responsible service">
          Only patrons above 25 will be served alcohol. Measures are listed before dilution; standard mixers are complimentary.
        </Note>
      </div>
    </Shell>
  )
}

function AgeGate({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2a1f17]/70 p-5 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-title"
        className="rise w-full max-w-[380px] rounded-[32px] bg-card p-6 shadow-2xl"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-blush text-clay">
          <Wine className="size-6" strokeWidth={1.3} />
        </span>
        <p className="mt-5 text-[11px] tracking-[0.1em] text-clay uppercase">Before you continue</p>
        <h2 id="age-title" className="mt-1 font-display text-[34px] leading-tight font-medium">
          A quick age check
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-soft">
          Only patrons above the age of 25 will be served alcoholic drinks.
        </p>
        <button
          autoFocus
          onClick={onContinue}
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-clay px-5 py-4 text-[15px] font-semibold text-white transition hover:bg-clay-deep active:scale-[0.99]"
        >
          Continue to drinks <ArrowRight className="size-4" />
        </button>
        <button
          onClick={onBack}
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-line bg-card px-5 py-4 text-[15px] font-semibold transition hover:bg-blush/50 active:scale-[0.99]"
        >
          Back to menu <ArrowLeft className="size-4" />
        </button>
        <p className="mt-5 text-center text-[11px] text-faint">Please enjoy responsibly. A valid government ID may be requested.</p>
      </div>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const [verified, setVerified] = useState(false)
  const [, part, extra] = ['', ...route.split('/')]
  const section = part ?? ''
  useEffect(() => {
    if (section !== 'drinks') setVerified(false)
  }, [section])

  if (section === 'drinks') {
    return (
      <>
        <DrinksMenu />
        {!verified && (
          <AgeGate
            onContinue={() => {
              setVerified(true)
            }}
            onBack={() => go('')}
          />
        )}
      </>
    )
  }
  if (section === 'food') {
    const cat = FOOD.find((c) => c.slug === extra)
    return cat ? <FoodListing key={cat.slug} category={cat} /> : <CategoryIndex />
  }
  return <Landing />
}
