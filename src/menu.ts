export type Diet = 'veg' | 'egg' | 'chicken' | 'seafood' | 'mutton'

export interface Price {
  label?: string
  value: number
}

export interface Item {
  name: string
  desc?: string
  /** null => "APS" (as per size). These are the AC prices. */
  prices: Price[] | null
  /** Non-AC prices; when undefined the AC prices apply to both sections. */
  nonAcPrices?: Price[] | null
  chef?: boolean
  diet: Diet
}

export interface Group {
  diet: Diet
  title: string
  tagline: string
  items: Item[]
}

export interface Category {
  slug: string
  title: string
  tagline: string
  icon: string
  groups: Group[]
}

export const DIET_ORDER: Diet[] = ['veg', 'egg', 'chicken', 'seafood', 'mutton']

export const DIET_META: Record<Diet, { title: string; tagline: string; color: string }> = {
  veg: { title: 'Veg', tagline: 'Garden, dairy and lentils', color: 'var(--diet-veg)' },
  egg: { title: 'Egg', tagline: 'Comforting, bold and gently spiced', color: 'var(--diet-egg)' },
  chicken: { title: 'Chicken', tagline: 'Free-range chicken, tandoor and handi', color: 'var(--diet-chicken)' },
  seafood: { title: 'Seafood', tagline: 'Coastal recipes and the day’s catch', color: 'var(--diet-seafood)' },
  mutton: { title: 'Mutton', tagline: 'Slow-cooked goat and heritage recipes', color: 'var(--diet-mutton)' },
}

/**
 * Line format:  Name [| note] [*] = 140
 *               Name = Half 270 / Full 450
 *               Name = APS
 *               Name = 140 ; 120          (AC ; Non-AC - omit "; ..." if same)
 * A trailing "*" after the name marks Chef's Pick.
 */
function parsePrices(text: string): Price[] | null {
  if (text.toUpperCase() === 'APS') return null
  return text.split('/').map((part) => {
    const m = part.trim().match(/^(?:(.*?)\s+)?(\d+)$/)
    return { label: m?.[1] || undefined, value: Number(m?.[2]) }
  })
}

function parseLine(line: string, diet: Diet): Item {
  const [left, right] = line.split('=').map((s) => s.trim())
  const chef = /\*$/.test(left)
  const [name, desc] = left.replace(/\*$/, '').split('|').map((s) => s.trim())
  const [ac, nonAc] = right.split(';').map((s) => s.trim())
  const prices = parsePrices(ac)
  return nonAc === undefined ? { name, desc, prices, chef, diet } : { name, desc, prices, nonAcPrices: parsePrices(nonAc), chef, diet }
}

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const items = (text: string, diet: Diet) => lines(text).map((l) => parseLine(l, diet))

const aps = (names: string, diet: Diet): Item[] =>
  names.split(',').map((n) => ({ name: n.trim(), prices: null, diet }))

function inferDiet(name: string): Diet {
  if (/prawn|crab|fish|pomfret|surmai|bangda/i.test(name)) return 'seafood'
  if (/mutton/i.test(name)) return 'mutton'
  if (/chicken|\bchi\b/i.test(name)) return 'chicken'
  if (/\begg\b/i.test(name)) return 'egg'
  return 'veg'
}

function group(diet: Diet, list: Item[]): Group {
  return { diet, title: DIET_META[diet].title, tagline: DIET_META[diet].tagline, items: list }
}

/** Splits a flat list by inferred diet; drops empty groups, keeps canonical order. */
function grouped(text: string): Group[] {
  const all = lines(text).map((l) => {
    const item = parseLine(l, 'veg')
    item.diet = inferDiet(item.name)
    return item
  })
  return DIET_ORDER.map((d) => group(d, all.filter((i) => i.diet === d))).filter((g) => g.items.length)
}

const soup = `
Sweet Corn Soup = 140
Hot N Sour Soup = 140
Veg Manchow Soup = 140
Veg Clear Soup = 140
Veg Talmen Soup = 160
Cream Of Tomato Soup = 140
Cream Of Palak Soup = 140
Cream Of Mushroom Soup = 180
Cream Of Veg Soup = 160
Veg Lung Fung Soup = 180
Veg Tuppa Soup = 160
Lemon Coriander Soup = 140
Eleven 45 Spl. Veg Soup = 150
Chicken Manchow Soup = 170
Chicken Clear Soup = 160
Chicken Sweetcorn Soup = 180
Hot N Sour Chicken Soup = 180
Chicken Mushroom Soup = 160
Chicken Tuppa Soup = 160
`

const starterVeg = `
Chana Garlic Oil Fry = 190
Boiled Chana = 150
Kaju Butter Fry = 250
Cheese Cubes = 120
Green Peas Butter Fry = 180
French Fries = 180
Paneer Pakoda = 200
Cheese Pakoda = 240
Paneer Koliwada = 240
Chana Koliwada = 190
Veg Kurkure = 280
Veg 65 = 200
Veg Chilly = 200
Veg Manchurian = 200
Veg Crispy = 230
Veg Lollypop = 230
Veg Spring Roll = 350
Paneer Chilly = Full 270 / Half 160
Paneer Manchurian = 260
Paneer 65 = 260
Paneer Sezwan = 260
Paneer Crispy = 260
Gobi Manchurian = 200
Veg Seekh Kabab = 300
Paneer Tikka = 280
Paneer Pahadi Kabab = 340
Paneer Malai Tikka = 340
Paneer Lassuni Tikka = 340
Veg Lassuni Palak Kabab = 280
Hara Bhara Kabab = 280
Veg Kurkure = 300
`

const starterEgg = `
Boiled Egg = 60
Boiled Egg Tawa Fry = 80
Egg Half Fry = 60
Egg Omlet = 80
Egg Burji = 120
Egg Pakoda = 140
Egg Koliwada = 140
Egg Masala Fry / Egg Curry = 200
Egg Chilly = 200
Egg Sezwan = 220
`

const starterChicken = `
Chicken Oil Fry = 240
Chicken Koliwada = 280
Chicken Pakoda = 260
Chicken Roast = Full 450 / Half 270
Chicken Ghree Roast = 290
Chicken Jeera = 290
Chicken Chilly = Full 260
Chicken Lollypop = Full 280 / Half 160
Chicken Manchurian = 260
Chicken 65 = Full 260 / Half 150
Chicken Sezwan = 260
Chicken Garlic = 270
Chicken Crispy = 270
Chicken Sathe = 300
Chicken Pepper Dry = 300
Chicken Tawa = 290
Chicken Spring Roll = 350
Chicken Sanghai = 280
Chicken Yeki Topi = 300
Chicken Hitler = 300
Chicken Marathe = 300
Chicken Lollypop Masala Dry = 320
Chicken Apple = 320
`

const starterMutton = `
Ghee Roast = 380
Jeera = 350
Khima = 350
Bhuna = 380
Seekh Kabab = 400
Rogan Josh = 380
Pepper Dry = 380
`

const starterSeafood = [
  ...aps(
    'Bangda Tawa Fry, Bangda Masala Fry, Bangda Fry, Mandeli Fry, Bombil Fry, Bombil Tawa Fry, Bombil Chilly, Surmai Fry, Surmai Tawa Fry, Surmai Tikka, Pomfret Fry, Pomfret Tawa Fry, Pomfret Tandoori, Halwa Tawa Fry, Halwa Tandoori, Rawas Tandoori, Rawas Tikka, Prawns Tikka, Prawns Chilly, Prawns 65, Prawns Sezwan, Prawns Manchurian, Prawns Koliwada, Prawns Tawa Fry, Prawns Masala Fry, Prawns Tandoori',
    'seafood',
  ),
  ...items('Fish Fingers = 390', 'seafood'),
]

const tandoor = `
Chicken Tandoori = Half 260 / Full 460
Chi Pahadi Tandoori = Half 280 / Full 480
Chi Kalimiri Tandoori = Half 290 / Full 490
Chi Sezwan Tandoori = Half 290 / Full 490
Chi Lollypop Tandoori = 330
Chicken Tikka = 290
Chicken Malai Tikka = 330
Chicken Liver / Tita Tandoori = 280
Chicken Reshmi Kabab = 310
Chicken Pahadi Kabab = 300
Chicken Kalimiri Kabab = 310
Chicken Seekh Kabab = 310
Chicken Tangdi Kabab = 2 Pcs 380 / 1 Pc 200
Chicken Lassuni Kabab = 290
Chicken Plater = 1100
Chicken Sunheri Kabab = 300
Chicken Multani Kabab = 330
Chicken Achari Kabab = 280
Chicken Banjara Kabab = 290
Chicken Angara Kabab = 320
Chicken Rozali Kabab = 320
Chicken Boti Kabab = 250
Chicken Kalmi = 350
Chicken Basthuni Kabab = 300
Chicken Janvi Kabab = 300
Chicken Shikari Kabab = 300
Khecha Chicken Tikka = 300
`

const mainVeg = `
Dal Fry = 180
Dal Tadka = 190
Bhendi Masala = 230
Bhendi Do Pyaza = 250
Baingan Masala = 230
Alu Palak = 200
Alu Gobi = 200
Alu Jeera = 180
Alu Mutter = 200
Chana Masala = 200
Mix Veg = 220
Veg Kolhapuri = 250
Veg Kadai = 260
Veg Hyderabadi = 260
Veg Kofta = 260
Veg Tawa Masala = 270
Veg Handi = 270
Veg Makhanwala = 230
Veg Jalfrezi = 230
Veg Jaipuri = 230
Veg Patiyala = 270
Gobi Amritsari = 300
Veg Nawabi = 280
Methi Mutter Masala = 280
Veg Jarina = 280
Veg Maharaja = 300
Veg Rajasthani = 280
Paneer Tikka Masala = 270
Paneer Makhanwala = 250
Paneer Kolhapuri = 250
Paneer Bhurji = 280
Paneer Palak = 250
Paneer Mutter = 250
Paneer Kadai = 270
Paneer Handi = 290
Paneer Amritsari = 300
Paneer Laziz = 300
Paneer Lajabab = 300
Paneer Moghlai = 280
Paneer Lasuni Palak = 280
Mushroom Masala = 280
Paneer Kofta = 300
Malai Methi Mutter = 250
Kaju Masala = 340
Dum Alu Punjabi = 280
Tomato Bhurji = 250
`

const mainChicken = `
Chicken Masala = 270
Chicken Sukkha = 280
Chicken Kolhapuri = 270
Chicken Hyderabadi = 270
Chicken Tikka Masala = 280
Chicken Liver Masala = 260
Chicken Kheema = 280
Chicken Tawa Masala = 300
Chicken Kadai = Full 600 / Half 380
Chicken Handi = Full 600 / Half 350
Butter Chicken * = Full 550 / Half 300
Murg Mussallam = Full 700 / Half 400
Chicken Malwani = Full 700 / Half 400
Chicken Agri = Full 700 / Half 400
Chicken Angara Kabab Masala = 350
Chicken Kabab Kulchan Masala = 350
Chicken Kalimiri Masala = 320
Chicken Afghani = 300
Chicken Moglai = 300
Chicken Jarina = 300
Chicken Rara = 300
Chicken Navabi Masala = 300
Chicken Do Pyaza = 270
Chicken Laziz = 280
`

const mainMutton = `
Mutton Masala = 400
Mutton Sukkha = 460
Mutton Kolhapuri = 460
Mutton Kheema = 450
Mutton Kadai = Full 800 / Half 450
Mutton Handi = Full 780 / Half 450
`

const roti = `
Roti = 25
Butter Roti = 30
Naan = 40
Butter Naan = 50
Paratha = 45
Butter Paratha = 50
Cheese Naan = 160
Garlic Naan = 80
Cheese Garlic Naan = 180
Butter Cheese Garlic Naan = 190
Kulcha = 40
Butter Kulcha = 50
Alu Paratha = 120
Stuff Paratha = 170
Paneer Paratha = 140
Garlic Kulcha = 60
`

const basmati = `
Steam Rice = 140
Steam Rice Half = 90
Jeera Rice = 160
Biryani Rice = 160
Ghee Rice = 160
Veg Pulav = 200
Veg Biryani = 220
Veg Tawa Pulav = 240
Dal Khichdi = 200
Dal Palak Khichdi = 220
Paneer Pulav = 260
Green Peas Pulav = 250
Paneer Biryani = 280
Veg Dum Biryani = 250
Veg Hyderabadi Biryani = 270
Paneer Dum Biryani = 300
Egg Biryani = 240
Chicken Biryani = 280
Mutton Biryani = 380
Prawns Biryani = 350
Chicken Dum Biryani = 300
Chicken Hyderabadi Biryani = 300
Chicken Tikka Biryani = 310
Mutton Dum Biryani = 390
Mutton Hyderabadi Biryani = 410
Chicken Afghani Biryani = 300
Chicken Calcutta Biryani = 300
`

const chineseTadka = `
Veg Manchurian | Dry / Gravy = 220
Veg Chilly | Dry / Gravy = 220
Paneer Chilly | Dry / Gravy = 240
Paneer Manchurian | Dry / Gravy = 240
Mushroom Manchurian | Dry / Gravy = 250
Veg 65 = 210
Paneer 65 = 250
Veg Lollypop | Dry / Gravy = 230
Chicken Chilly | Dry / Gravy = Full 260 / Half 150
Chicken Lollypop | Dry = Full 260 / Half 150
Chicken 65 = Full 250 / Half 150
Chicken Crispy = Full 270 / Half 170
Chicken Garlic = 260
Chicken Sathe = 310
`

const chineseRice = `
Veg Fried Rice = 180
Veg Sezwan Fried Rice = 200
Veg Tripple Sezwan Fried Rice = 250
Veg Hong Kong Fried Rice = 240
Veg Singapore Fried Rice = 240
Veg Chopper Fried Rice = 250
Veg Manchurian Fried Rice = 280
Veg Combination Fried Rice = 240
Mushroom Fried Rice = 250
Veg Hakka Noodles = 200
Veg Sezwan Noodles = 230
Veg Tripple Noodles = 250
Veg Kolhapuri Rice = 280
Chicken Fried Rice = 220
Chicken Sezwan Fried Rice = 230
Chi Tripple Sezwan Fried Rice = 290
Chi Manchurian Fried Rice = 290
Chi Hongkong Fried Rice = 290
Chicken Chopper Fried Rice = 310
Chicken Hakka Noodles = 250
Chicken Sezwan Noodles = 250
Egg Fried Rice = 190
Prawns Fried Rice = 350
Chicken Sanghai Rice = 350
Chicken Boxer Rice = 350
`

const khane = `
Green Salad = 100
Plain Curd = 80
Veg Raita = 100
Roasted Papad = 30
Fried Papad = 30
Masala Papad = 80
`

const tandoorItems = lines(tandoor).map((l) => parseLine(l, 'chicken'))
const tandoorItemsChef = tandoorItems.map((i) => (i.name === 'Chicken Tandoori' ? { ...i, chef: true } : i))
const paneerTikka = (i: Item) => (i.name === 'Paneer Tikka' ? { ...i, chef: true } : i)

export const FOOD: Category[] = [
  {
    slug: 'soup',
    title: 'Soup',
    tagline: 'Comforting bowls',
    icon: 'soup',
    groups: grouped(soup),
  },
  {
    slug: 'starter',
    title: 'Starter',
    tagline: 'Small plates to share',
    icon: 'salad',
    groups: [
      group('veg', items(starterVeg, 'veg').map(paneerTikka)),
      group('egg', items(starterEgg, 'egg')),
      group('chicken', items(starterChicken, 'chicken')),
      group('seafood', starterSeafood),
      group('mutton', items(starterMutton, 'mutton')),
    ],
  },
  {
    slug: 'tandoor-se',
    title: 'Tandoor Se',
    tagline: 'From the clay oven',
    icon: 'flame',
    groups: [group('chicken', tandoorItemsChef)],
  },
  {
    slug: 'main-course',
    title: 'Main Course',
    tagline: 'House signatures & classics',
    icon: 'pot',
    groups: [
      group('veg', items(mainVeg, 'veg')),
      group('egg', items('Egg Tawa Masala = 180', 'egg')),
      group('chicken', items(mainChicken, 'chicken')),
      group(
        'seafood',
        aps('Bangda Masala, Pomfret Masala, Surmai Masala, Halwa Masala, Crab Masala', 'seafood'),
      ),
      group('mutton', items(mainMutton, 'mutton')),
    ],
  },
  {
    slug: 'roti-ka-khazana',
    title: 'Roti Ka Khazana',
    tagline: 'Breads from our tandoor',
    icon: 'disc',
    groups: grouped(roti),
  },
  {
    slug: 'basmati-ki-bahar',
    title: 'Basmati Ki Bahar',
    tagline: 'Fragrant rice & biryani',
    icon: 'wheat',
    groups: grouped(basmati).map((g) => ({
      ...g,
      items: g.items.map((i) => (i.name === 'Mutton Dum Biryani' ? { ...i, chef: true } : i)),
    })),
  },
  {
    slug: 'chinese-ka-tadka',
    title: 'Chinese Ka Tadka',
    tagline: 'Indo-Chinese favourites',
    icon: 'sparkles',
    groups: grouped(chineseTadka),
  },
  {
    slug: 'chinese-rice-noodles',
    title: 'Chinese Rice & Noodles',
    tagline: 'Wok-tossed classics',
    icon: 'utensils',
    groups: grouped(chineseRice),
  },
  {
    slug: 'khane-ke-saath',
    title: 'Khane Ke Saath',
    tagline: 'Raita, salad & accompaniments',
    icon: 'leaf',
    groups: grouped(khane),
  },
]

const acPriceUpdates = (text: string) =>
  new Map(
    lines(text).map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator).trim(), parsePrices(line.slice(separator + 1).trim())] as const
    }),
  )

const AC_FOOD_PRICES: Record<string, Map<string, Price[] | null>> = {
  soup: acPriceUpdates(`
Sweet Corn Soup = 180
Hot N Sour Soup = 180
Veg Manchow Soup = 180
Veg Clear Soup = 180
Veg Talmen Soup = 200
Cream Of Tomato Soup = 180
Cream Of Palak Soup = 180
Cream Of Mushroom Soup = 220
Cream Of Veg Soup = 200
Veg Lung Fung Soup = 220
Veg Tuppa Soup = 200
Lemon Coriander Soup = 180
Eleven 45 Spl. Veg Soup = 200
Chicken Manchow Soup = 210
Chicken Clear Soup = 200
Chicken Sweetcorn Soup = 220
Hot N Sour Chicken Soup = 220
Chicken Mushroom Soup = 200
Chicken Tuppa Soup = 200`),
  starter: acPriceUpdates(`
Chana Garlic Oil Fry = 230
Boiled Chana = 190
Kaju Butter Fry = 290
Cheese Cubes = 160
Green Peas Butter Fry = 220
French Fries = 220
Paneer Pakoda = 240
Cheese Pakoda = 280
Paneer Koliwada = 240
Chana Koliwada = 230
Veg Kurkure = 320
Veg 65 = 240
Veg Chilly = 240
Veg Manchurian = 240
Veg Crispy = 270
Veg Lollypop = 270
Veg Spring Roll = 390
Paneer Chilly = Full 310 / Half 200
Paneer Manchurian = 300
Paneer 65 = 300
Paneer Sezwan = 300
Paneer Crispy = 300
Gobi Manchurian = 300
Veg Seekh Kabab = 240
Paneer Tikka = 340
Paneer Pahadi Kabab = 320
Paneer Malai Tikka = 380
Paneer Lassuni Tikka = 380
Veg Lassuni Palak Kabab = 380
Hara Bhara Kabab = 320
Boiled Egg = 80
Boiled Egg Tawa Fry = 100
Egg Half Fry = 80
Egg Omlet = 100
Egg Burji = 130
Egg Pakoda = 160
Egg Koliwada = 160
Egg Masala Fry / Egg Curry = 240
Egg Chilly = 240
Egg Sezwan = 260
Chicken Oil Fry = 280
Chicken Koliwada = 320
Chicken Pakoda = 300
Chicken Roast = Full 490 / Half 310
Chicken Ghree Roast = 330
Chicken Jeera = 330
Chicken Chilly = Full 300
Chicken Lollypop = Full 320 / Half 200
Chicken Manchurian = 300
Chicken 65 = Full 300 / Half 190
Chicken Sezwan = 300
Chicken Garlic = 340
Chicken Crispy = Full 340
Chicken Sathe = 330
Chicken Pepper Dry = 340
Chicken Tawa = 330
Chicken Spring Roll = 390
Chicken Sanghai = 320
Chicken Yeki Topi = 340
Chicken Hitler = 340
Chicken Marathe = 340
Chicken Lollypop Masala Dry = 360
Chicken Apple = 360
Ghee Roast = 420
Jeera = 390
Khima = 390
Bhuna = 420
Seekh Kabab = 440
Rogan Josh = 420
Pepper Dry = 420
Fish Fingers = 390`),
  'tandoor-se': acPriceUpdates(`
Chicken Tandoori = Half 300 / Full 500
Chi Pahadi Tandoori = Half 340 / Full 520
Chi Kalimiri Tandoori = Half 320 / Full 530
Chi Sezwan Tandoori = Half 330 / Full 530
Chi Lollypop Tandoori = 380
Chicken Tikka = 330
Chicken Malai Tikka = 370
Chicken Liver / Tita Tandoori = 320
Chicken Reshmi Kabab = 350
Chicken Pahadi Kabab = 340
Chicken Kalimiri Kabab = 350
Chicken Seekh Kabab = 350
Chicken Tangdi Kabab = 2 Pcs 420 / 1 Pc 240
Chicken Lassuni Kabab = 330
Chicken Plater = 1150
Chicken Sunheri Kabab = 350
Chicken Multani Kabab = 380
Chicken Achari Kabab = 320
Chicken Banjara Kabab = 340
Chicken Angara Kabab = 360
Chicken Rozali Kabab = 360
Chicken Boti Kabab = 300
Chicken Kalmi = 400
Chicken Basthuni Kabab = 350
Chicken Janvi Kabab = 350
Chicken Shikari Kabab = 350
Khecha Chicken Tikka = 350`),
  'main-course': acPriceUpdates(`
Dal Fry = 220
Dal Tadka = 230
Bhendi Masala = 270
Bhendi Do Pyaza = 290
Baingan Masala = 270
Alu Palak = 240
Alu Gobi = 240
Alu Jeera = 220
Alu Mutter = 240
Chana Masala = 240
Mix Veg = 260
Veg Kolhapuri = 290
Veg Kadai = 300
Veg Hyderabadi = 300
Veg Kofta = 300
Veg Tawa Masala = 310
Veg Handi = 310
Veg Makhanwala = 270
Veg Jalfrezi = 280
Veg Jaipuri = 280
Veg Patiyala = 310
Gobi Amritsari = 340
Veg Nawabi = 320
Methi Mutter Masala = 320
Veg Jarina = 320
Veg Maharaja = 340
Veg Rajasthani = 320
Paneer Tikka Masala = 310
Paneer Makhanwala = 290
Paneer Kolhapuri = 290
Paneer Bhurji = 320
Paneer Palak = 300
Paneer Mutter = 300
Paneer Kadai = 320
Paneer Handi = 340
Paneer Amritsari = 340
Paneer Laziz = 340
Paneer Lajabab = 350
Paneer Moghlai = 330
Paneer Lasuni Palak = 330
Mushroom Masala = 320
Paneer Kofta = 350
Malai Methi Mutter = 300
Kaju Masala = 390
Dum Alu Punjabi = 320
Tomato Bhurji = 290
Egg Tawa Masala = 200
Chicken Masala = 310
Chicken Sukkha = 320
Chicken Kolhapuri = 310
Chicken Hyderabadi = 310
Chicken Tikka Masala = 320
Chicken Liver Masala = 300
Chicken Kheema = 320
Chicken Tawa Masala = 340
Chicken Kadai = Full 650 / Half 390
Chicken Handi = Full 650 / Half 390
Butter Chicken = Full 650 / Half 400
Murg Mussallam = Full 750 / Half 450
Chicken Malwani = Full 750 / Half 450
Chicken Agri = Full 750 / Half 450
Chicken Angara Kabab Masala = 400
Chicken Kabab Kulchan Masala = 400
Chicken Kalimiri Masala = 360
Chicken Afghani = 340
Chicken Moglai = 340
Chicken Jarina = 340
Chicken Rara = 340
Chicken Navabi Masala = 340
Chicken Do Pyaza = 310
Chicken Laziz = 320
Mutton Masala = 440
Mutton Sukkha = 500
Mutton Kolhapuri = 500
Mutton Kheema = 500
Mutton Kadai = Full 850 / Half 500
Mutton Handi = Full 830 / Half 490
Bangda Masala = APS
Pomfret Masala = APS
Surmai Masala = APS
Halwa Masala = APS
Crab Masala = APS`),
  'roti-ka-khazana': acPriceUpdates(`
Roti = 30
Butter Roti = 40
Naan = 50
Butter Naan = 60
Paratha = 55
Butter Paratha = 60
Cheese Naan = 200
Garlic Naan = 120
Cheese Garlic Naan = 220
Butter Cheese Garlic Naan = 230
Kulcha = 50
Butter Kulcha = 60
Alu Paratha = 160
Stuff Paratha = 200
Paneer Paratha = 200
Garlic Kulcha = 90`),
  'basmati-ki-bahar': acPriceUpdates(`
Steam Rice = 160
Steam Rice Half = 110
Jeera Rice = 190
Biryani Rice = 180
Ghee Rice = 130
Veg Pulav = 240
Veg Biryani = 260
Veg Tawa Pulav = 280
Dal Khichdi = 240
Dal Palak Khichdi = 260
Paneer Pulav = 300
Green Peas Pulav = 290
Paneer Biryani = 330
Veg Dum Biryani = 300
Veg Hyderabadi Biryani = 320
Paneer Dum Biryani = 350
Egg Biryani = 240
Chicken Biryani = 280
Mutton Biryani = 380
Prawns Biryani = 350
Chicken Dum Biryani = 300
Chicken Hyderabadi Biryani = 300
Chicken Tikka Biryani = 310
Mutton Dum Biryani = 390
Mutton Hyderabadi Biryani = 410
Chicken Afghani Biryani = 300
Chicken Calcutta Biryani = 300`),
  'chinese-rice-noodles': acPriceUpdates(`
Veg Fried Rice = 220
Veg Sezwan Fried Rice = 240
Veg Tripple Sezwan Fried Rice = 290
Veg Hong Kong Fried Rice = 280
Veg Singapore Fried Rice = 280
Veg Chopper Fried Rice = 290
Veg Manchurian Fried Rice = 320
Veg Combination Fried Rice = 280
Mushroom Fried Rice = 290
Veg Hakka Noodles = 240
Veg Sezwan Noodles = 270
Veg Tripple Noodles = 290
Veg Kolhapuri Rice = 320
Chicken Fried Rice = 260
Chicken Sezwan Fried Rice = 270
Chi Tripple Sezwan Fried Rice = 330
Chi Manchurian Fried Rice = 330
Chi Hongkong Fried Rice = 330
Chicken Chopper Fried Rice = 350
Chicken Hakka Noodles = 290
Chicken Sezwan Noodles = 290
Egg Fried Rice = 230
Prawns Fried Rice = 390
Chicken Sanghai Rice = 300
Chicken Boxer Rice = 390`),
  'khane-ke-saath': acPriceUpdates(`
Green Salad = 150
Plain Curd = 110
Veg Raita = 130
Roasted Papad = 40
Fried Papad = 40
Masala Papad = 100`),
}

for (const category of FOOD) {
  const updates = AC_FOOD_PRICES[category.slug]
  for (const group of category.groups) {
    for (const item of group.items) {
      const nonAcPrices = item.prices
      item.nonAcPrices = nonAcPrices
      const prices = updates?.get(item.name)
      if (prices !== undefined) item.prices = prices
    }
  }
}

export interface DrinkSection {
  slug: string
  title: string
  tagline: string
  tone: 'maroon' | 'green'
  items: { name: string; desc: string; prices: Price[]; nonAcPrices?: Price[]; chef?: boolean }[]
}

const barItems = (text: string) =>
  text
    .trim()
    .split('\n')
    .map((line) => {
      const [name, desc, values] = line.split('|')
      return {
        name,
        desc,
        prices: values.split(',').map((entry) => {
          const [label, value] = entry.split(':')
          return { label: label === 'NIP' ? '180 ml' : label === 'Price' ? undefined : label, value: Number(value) }
        }),
      }
    })

const barSection = (slug: string, title: string, tagline: string, tone: 'maroon' | 'green', text: string): DrinkSection => ({
  slug,
  title,
  tagline: tagline.replace('NIP 180 ml', '180 ml'),
  tone,
  items: barItems(text),
})

const normalizeDrinkName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')

const toDrinkPrices = (values: Array<number | null>, sizes = ['180 ml', '90 ml', '60 ml', '30 ml']): Price[] =>
  values.flatMap((value, index) => {
    if (value == null) return []
    return [{ label: values.length === 1 ? undefined : sizes[index] ?? undefined, value }]
  })

const NON_AC_DRINK_PRICES: Record<string, Record<string, Array<number | null>>> = {
  scotch: {
    dewars_12_year: [1350, 680, 460, 235],
    black_dog_12_year: [1185, 600, 405, 210],
    teachers: [1020, 515, 350, 180],
    black_white: [985, 500, 340, 175],
    ballantine: [1020, 515, 350, 180],
    jb: [975, 495, 335, 175],
    red_label: [975, 495, 335, 175],
    black_dog: [null, null, null, null],
    vat_69: [945, 480, 325, 170],
    '100_pipers': [990, 500, 340, 175],
    dewars_white_label: [850, 430, 295, 155],
    william_lawsons: [675, 345, 235, 125],
  },
  'premium-whiskey': {
    blenders_pride_reserve: [630, 320, 220, 115],
    antiquity_blue: [645, 330, 225, 120],
    oaksmith_gold: [600, 305, 210, 110],
    blenders_pride: [570, 290, 200, 105],
    legacy_premium: [525, 270, 185, 100],
    signature_premium: [570, 290, 200, 105],
    signature_rare: [570, 290, 200, 105],
    sterling_b10: [495, 255, 175, 95],
    american_pride: [550, 280, 195, 105],
    mcd_platinum: [390, 200, 140, 75],
    oaksmith_silver: [495, 255, 175, 95],
    royalstag_barrel: [450, 230, 160, 85],
    rstag_dark: [420, 215, 150, 80],
    royal_green: [390, 200, 140, 75],
  },
  'regular-whiskey': {
    royal_challenge: [390, 200, 140, 75],
    royal_stag: [375, 195, 135, 75],
    sterling_b7: [390, 200, 140, 75],
    mcd_luxury: [345, 180, 125, 70],
    iconiq_white: [345, 180, 125, 70],
    imperial_blue: [330, 170, 120, 65],
    mcd_no_1: [330, 170, 120, 65],
    green_label: [330, 170, 120, 65],
    oc_blue: [240, 125, 90, 50],
    dsp_black: [315, 165, 115, 65],
    dsp: [205, 110, 80, 45],
    oc: [330, 170, 120, 65],
    bp: [315, 165, 115, 65],
    '8_pm': [300, 155, 110, 60],
    hayward: [300, 155, 110, 60],
  },
  brandy: {
    manson_house: [370, 190, 135, 75],
    reserve_no_1: [270, 140, 100, 55],
    honey_bee: [265, 140, 100, 55],
    dr_brandy: [260, 155, 110, 60],
  },
  rum: {
    bacardi_lemon: [610, 310, 215, 115],
    bacardi_white: [585, 300, 205, 110],
    bacardi_black: [375, 195, 135, 75],
    captain_morgan: [255, 135, 95, 50],
    old_monk: [325, 170, 120, 65],
    mcd_rum: [310, 160, 115, 65],
    imperial_red_rum: [205, 110, 80, 45],
  },
  gin: {
    blue_riband_duet: [330, 170, 120, 65],
  },
  vodka: {
    absolut_vodka: [975, 495, 335, 180],
    smirnoff_flavored: [610, 310, 215, 115],
    smirnoff_plain: [585, 300, 205, 110],
    grand_master: [450, 230, 160, 85],
    magic_moment_flavored: [420, 215, 150, 80],
    magic_moment: [420, 215, 150, 80],
    fuel: [270, 140, 100, 55],
    white_mishaps: [270, 140, 100, 55],
    romano_flavored: [420, 215, 150, 80],
    romano_plain: [330, 170, 120, 65],
    haywards_vodka: [300, 155, 110, 60],
  },
  'beer-strong': {
    budweiser: [375, 300, 235],
    carlsberg: [375, 300, 235],
    bira_rice: [345, 300, 235],
    bira_91_gold: [315, 270, 225],
    copter_7: [315, 270, 225],
    bira_91_boom: [285, 225, null],
    tuborg: [285, 225, null],
    kf: [295, 225, 180],
    lp: [285, 220, 180],
    beer_strong: [250, 205, 165],
  },
  'beer-mild': {
    bira_91_white: [345, 300, 225],
    carlsberg: [360, 300, 225],
    budweiser: [370, 285, 195],
    tuborg_ice: [330, 285, 195],
    bira_91_blond: [300, 265, null],
    copter_7: [285, 255, 190],
    tuborg: [300, 225, 190],
    kf: [300, 235, 180],
    lp: [300, 220, 180],
  },
  wine: {
    sula_red: [465, 240],
    sula_white: [300, 155],
    madira: [170, 90],
    dia_red: [160, 85],
    port: [160, 85],
  },
  'ready-to-drink': {
    bs_trd_can: [525],
    breezer_bliss: [225],
    breezer: [225],
  },
  'cold-drinks': {
    cold_750: [60],
    cold_300: [40],
    cold_250: [30],
    cold_200: [15],
    soda_750: [30],
    soda_300: [15],
    mineral_water_1l: [25],
    mineral_water_500: [15],
  },
}

const DRINK_NAME_ALIASES: Record<string, string> = {
  dewars: 'dewars_12_year',
  teacher_s: 'teachers',
  william_lawson_s: 'william_lawsons',
  black_dog_centenary: 'black_dog_12_year',
  black_dog_12_year: 'black_dog_12_year',
  black_dog: 'black_dog',
  vat_69: 'vat_69',
  '100_pipers': '100_pipers',
  royal_stag_barrel: 'royalstag_barrel',
  rstag_dark: 'rstag_dark',
  royal_challenge: 'royal_challenge',
  mcd_no1: 'mcd_no_1',
  mcd_no_1: 'mcd_no_1',
  dr_brady: 'dr_brandy',
  dr_brandy: 'dr_brandy',
  imperial_red_rim: 'imperial_red_rum',
  blue_riband_duet: 'blue_riband_duet',
  blue_riband: 'blue_riband_duet',
  smirnoff_plaine: 'smirnoff_plain',
  romano_plaine: 'romano_plain',
  haywards_vodka: 'haywards_vodka',
  beer_strong: 'beer_strong',
  bira_91_blonde: 'bira_91_blond',
  birav_91_blond: 'bira_91_blond',
  cold_750: 'cold_750',
  cold_300: 'cold_300',
  cold_250: 'cold_250',
  cold_200: 'cold_200',
  soda_750: 'soda_750',
  soda_300: 'soda_300',
  mineral_water_1000_ml: 'mineral_water_1l',
  mineral_water_1l: 'mineral_water_1l',
  mineral_water_500_ml: 'mineral_water_500',
  mineral_water_500: 'mineral_water_500',
}

export const DRINKS: DrinkSection[] = [
  barSection('scotch', 'Scotch', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Dewar's 12 Year|Scotch|NIP:1490,90 ml:750,60 ml:505,30 ml:260
Black Dog 12 Year|Scotch|NIP:1305,90 ml:660,60 ml:445,30 ml:230
Teacher's|Scotch|NIP:1125,90 ml:570,60 ml:385,30 ml:200
Black & White|Scotch|NIP:1085,90 ml:550,60 ml:375,30 ml:195
Ballantine|Scotch|NIP:1125,90 ml:570,60 ml:385,30 ml:200
J&B|Scotch|NIP:1075,90 ml:545,60 ml:370,30 ml:190
Red Label|Scotch|NIP:1075,90 ml:545,60 ml:370,30 ml:190
Black Dog Centenary|Scotch|NIP:1075,90 ml:545,60 ml:370,30 ml:190
Vat 69|Scotch|NIP:1045,90 ml:530,60 ml:360,30 ml:185
100 Pipers|Scotch|NIP:1090,90 ml:550,60 ml:375,30 ml:195
Dewar's White Label|Scotch|NIP:935,90 ml:475,60 ml:325,30 ml:170
William Lawson's|Scotch|NIP:745,90 ml:380,60 ml:260,30 ml:135`),
  barSection('premium-whiskey', 'Premium Whiskey', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Blender's Pride Reserve|Whiskey|NIP:695,90 ml:355,60 ml:245,30 ml:130
Antiquity Blue|Whiskey|NIP:710,90 ml:360,60 ml:245,30 ml:130
Oaksmith Gold|Whiskey|NIP:660,90 ml:335,60 ml:230,30 ml:120
Blender's Pride|Whiskey|NIP:630,90 ml:320,60 ml:220,30 ml:115
Legacy Premium|Whiskey|NIP:580,90 ml:295,60 ml:205,30 ml:110
Signature Premium|Whiskey|NIP:630,90 ml:320,60 ml:220,30 ml:115
Signature Rare|Whiskey|NIP:630,90 ml:320,60 ml:220,30 ml:115
Sterling B10|Whiskey|NIP:545,90 ml:280,60 ml:195,30 ml:105
American Pride|Whiskey|NIP:605,90 ml:310,60 ml:215,30 ml:115
MCD Platinum|Whiskey|NIP:430,90 ml:220,60 ml:155,30 ml:85
Oaksmith Silver|Whiskey|NIP:545,90 ml:280,60 ml:195,30 ml:105
Royal Stag Barrel|Whiskey|NIP:495,90 ml:255,60 ml:175,30 ml:95
Royal Stag Dark|Whiskey|NIP:465,90 ml:240,60 ml:165,30 ml:90
Royal Green|Whiskey|NIP:430,90 ml:220,60 ml:155,30 ml:85`),
  barSection('regular-whiskey', 'Regular Whiskey', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Royal Challenge|Whiskey|NIP:430,90 ml:220,60 ml:155,30 ml:85
Royal Stag|Whiskey|NIP:415,90 ml:215,60 ml:150,30 ml:80
Sterling B7|Whiskey|NIP:430,90 ml:220,60 ml:155,30 ml:85
MCD Luxury|Whiskey|NIP:380,90 ml:195,60 ml:135,30 ml:75
Iconiq White|Whiskey|NIP:380,90 ml:195,60 ml:135,30 ml:75
Imperial Blue|Whiskey|NIP:365,90 ml:190,60 ml:135,30 ml:75
MCD No1|Whiskey|NIP:365,90 ml:190,60 ml:135,30 ml:75
Green Label|Whiskey|NIP:365,90 ml:190,60 ml:135,30 ml:75
OC Blue|Whiskey|NIP:265,90 ml:140,60 ml:100,30 ml:55
DSP Black|Whiskey|NIP:350,90 ml:180,60 ml:125,30 ml:70
DSP|Whiskey|NIP:225,90 ml:120,60 ml:85,30 ml:50
OC|Whiskey|NIP:365,90 ml:190,60 ml:135,30 ml:75
BP|Whiskey|NIP:350,90 ml:180,60 ml:125,30 ml:70
8 P.M.|Whiskey|NIP:330,90 ml:170,60 ml:120,30 ml:65
Hayward|Whiskey|NIP:330,90 ml:170,60 ml:120,30 ml:65`),
  barSection('brandy', 'Brandy', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Manson House|Brandy|NIP:405,90 ml:210,60 ml:145,30 ml:80
Reserve No 1|Brandy|NIP:300,90 ml:155,60 ml:110,30 ml:60
Honey Bee|Brandy|NIP:290,90 ml:150,60 ml:105,30 ml:60
Dr Brady|Brandy|NIP:330,90 ml:170,60 ml:120,30 ml:65`),
  barSection('rum', 'Rum', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Bacardi Lemon|Rum|NIP:670,90 ml:340,60 ml:235,30 ml:125
Bacardi White|Rum|NIP:645,90 ml:330,60 ml:225,30 ml:120
Bacardi Black|Rum|NIP:415,90 ml:215,60 ml:150,30 ml:80
Captain Morgan|Rum|NIP:280,90 ml:145,60 ml:105,30 ml:60
Old Monk|Rum|NIP:355,90 ml:185,60 ml:130,30 ml:70
MCD Rum|Rum|NIP:340,90 ml:175,60 ml:125,30 ml:70
Imperial Red Rim|Rum|NIP:225,90 ml:120,60 ml:85,30 ml:50`),
  barSection('gin', 'Gin', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', 'Blue Riband|Gin|NIP:365,90 ml:190,60 ml:135,30 ml:75'),
  barSection('vodka', 'Vodka', 'NIP 180 ml · 90 ml · 60 ml · 30 ml', 'maroon', `
Absolut Vodka|Vodka|NIP:1075,90 ml:545,60 ml:370,30 ml:190
Smirnoff Flavored|Vodka|NIP:670,90 ml:340,60 ml:235,30 ml:125
Smirnoff Plaine|Vodka|NIP:645,90 ml:330,60 ml:225,30 ml:120
Grand Master|Vodka|NIP:495,90 ml:255,60 ml:175,30 ml:95
Magic Moment Flavored|Vodka|NIP:465,90 ml:240,60 ml:165,30 ml:90
Magic Moment|Vodka|NIP:465,90 ml:240,60 ml:165,30 ml:90
Fuel|Vodka|NIP:300,90 ml:155,60 ml:110,30 ml:60
White Mishaps|Vodka|NIP:465,90 ml:240,60 ml:165,30 ml:90
Romano Flavored|Vodka|NIP:365,90 ml:190,60 ml:135,30 ml:75
Romano Plaine|Vodka|NIP:365,90 ml:190,60 ml:135,30 ml:75
Haywards|Vodka|NIP:330,90 ml:170,60 ml:120,30 ml:65`),
  barSection('beer-strong', 'Beer Strong', '650 ml · 500 ml · 330 ml', 'maroon', `
Budweiser|Beer|650 ml:415,500 ml:330,330 ml:255
Carlsberg|Beer|650 ml:415,500 ml:330,330 ml:255
Bira Rice|Beer|650 ml:380,330 ml:255
Bira 91 Gold|Beer|650 ml:350,500 ml:300,330 ml:250
Copter 7|Beer|650 ml:315,500 ml:250
Bira 91 Boom|Beer|650 ml:315,500 ml:240
Tuborg|Beer|650 ml:325,500 ml:250,330 ml:200
KF|Beer|650 ml:315,500 ml:240,330 ml:190
LP|Beer|650 ml:275,500 ml:225,330 ml:180`),
  barSection('beer-mild', 'Beer Mild', '650 ml · 500 ml · 330 ml', 'maroon', `
Bira 91 White|Beer|650 ml:380,500 ml:330,330 ml:250
Carlsberg|Beer|650 ml:395,500 ml:315,330 ml:215
Budweiser|Beer|650 ml:405,500 ml:315,330 ml:215
Tuborg Ice|Beer|650 ml:365,500 ml:290
Bira 91 Blonde|Beer|650 ml:330,500 ml:280,330 ml:205
Copter 7|Beer|650 ml:315,500 ml:250
Tuborg|Beer|650 ml:330,500 ml:255,330 ml:200
KF|Beer|650 ml:330,500 ml:240,330 ml:205
LP|Beer|650 ml:230,500 ml:165,330 ml:150`),
  barSection('wine', 'Wine', 'NIP 180 ml · 90 ml', 'maroon', `
Sula Red|Wine|NIP:515,90 ml:265
Sula White|Wine|NIP:330,90 ml:170
Madira|Wine|NIP:185,90 ml:100
Dia Red|Wine|NIP:175,90 ml:95
Port|Wine|NIP:175,90 ml:95`),
  barSection('ready-to-drink', 'Ready To Drink', 'NIP 180 ml', 'maroon', `
BS TRD Can|Ready to drink|NIP:580
Breezer Bliss|Ready to drink|NIP:250
Breezer|Ready to drink|NIP:250`),
  barSection('cold-drinks', 'Cold Drinks', 'Bottles and soft drinks', 'green', `
Cold 750 ml|Cold drink|Price:70
Cold 300 ml|Cold drink|Price:45
Cold 250 ml|Cold drink|Price:35
Cold 200 ml|Cold drink|Price:20
Soda 750 ml|Soda|Price:40
Soda 300 ml|Soda|Price:20
Mineral Water 1000 ml|Mineral water|Price:30
Mineral Water 500 ml|Mineral water|Price:20`),
]

for (const section of DRINKS) {
  const pricing = NON_AC_DRINK_PRICES[section.slug]
  if (!pricing) continue

  for (const item of section.items) {
    const key = normalizeDrinkName(item.name)
    const canonical = DRINK_NAME_ALIASES[key] ?? key
    const prices = pricing[canonical]
    if (prices) item.nonAcPrices = toDrinkPrices(prices)
  }
}
