export type Diet = 'veg' | 'egg' | 'chicken' | 'seafood' | 'mutton'

export interface Price {
  label?: string
  value: number
}

export interface Item {
  name: string
  desc?: string
  /** null => "APS" (as per size) */
  prices: Price[] | null
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
 * A trailing "*" after the name marks Chef's Pick.
 */
function parseLine(line: string, diet: Diet): Item {
  const [left, right] = line.split('=').map((s) => s.trim())
  const chef = /\*$/.test(left)
  const [name, desc] = left.replace(/\*$/, '').split('|').map((s) => s.trim())
  let prices: Price[] | null = null
  if (right.toUpperCase() !== 'APS') {
    prices = right.split('/').map((part) => {
      const m = part.trim().match(/^(?:(.*?)\s+)?(\d+)$/)
      return { label: m?.[1] || undefined, value: Number(m?.[2]) }
    })
  }
  return { name, desc, prices, chef, diet }
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

export interface DrinkSection {
  slug: string
  title: string
  tagline: string
  tone: 'maroon' | 'green'
  items: { name: string; desc: string; price: number; chef?: boolean }[]
}

export const DRINKS: DrinkSection[] = [
  {
    slug: 'mehfil-signatures',
    title: 'Mehfil Signatures',
    tagline: 'House cocktails · 60 ml pour',
    tone: 'maroon',
    items: [
      { name: 'Saffron Highball', desc: 'Indian whisky, saffron cordial, soda and grapefruit', price: 675, chef: true },
      { name: 'Jamun Gimlet', desc: 'Dry gin, jamun, lime and black salt', price: 625 },
      { name: 'Monsoon Negroni', desc: 'Gin, kokum vermouth and bitter orange', price: 695 },
      { name: 'Mango Chilli Margarita', desc: 'Tequila, raw mango, chilli and agave', price: 675 },
    ],
  },
  {
    slug: 'wine',
    title: 'Wine by the Glass',
    tagline: '150 ml · Ask for today’s bottle list',
    tone: 'maroon',
    items: [
      { name: 'Grover Zampa Soirée Brut', desc: 'Nashik · citrus, brioche, fine bubbles', price: 725 },
      { name: 'Sula Riesling', desc: 'Nashik · off-dry, lime and white blossom', price: 595 },
      { name: 'Fratelli Sette', desc: 'Akluj · Sangiovese blend, cherry and cedar', price: 795, chef: true },
    ],
  },
  {
    slug: 'spirits',
    title: 'Indian Spirits',
    tagline: '30 ml · Served neat, on ice or with a mixer',
    tone: 'maroon',
    items: [
      { name: 'Amrut Fusion Single Malt', desc: 'Bengaluru · malt, cacao and soft smoke', price: 625 },
      { name: 'Paul John Bold', desc: 'Goa · honey, pepper and coastal peat', price: 595 },
      { name: 'Stranger & Sons Gin', desc: 'Goa · pepper, coriander and citrus peel', price: 525 },
      { name: 'Maka Zai Gold Rum', desc: 'Goa · praline, oak and warm spice', price: 475 },
    ],
  },
  {
    slug: 'beer-cider',
    title: 'Beer & Cider',
    tagline: 'Chilled bottles and cans',
    tone: 'maroon',
    items: [
      { name: 'Bira 91 White', desc: 'Wheat beer · 330 ml', price: 395 },
      { name: 'Simba Stout', desc: 'Coffee, cacao · 330 ml', price: 425 },
      { name: 'BeeYoung Crafted Strong', desc: 'Crisp lager · 500 ml', price: 445 },
      { name: 'Moonshine Apple Cider', desc: 'Dry, bright and gently sparkling · 330 ml', price: 425 },
    ],
  },
  {
    slug: 'zero-proof',
    title: 'Zero Proof',
    tagline: 'Layered pours without alcohol',
    tone: 'green',
    items: [
      { name: 'Kokum Fizz', desc: 'Kokum, curry leaf, lime and sparkling water', price: 325, chef: true },
      { name: 'Nimbu & Basil Cooler', desc: 'Gondhoraj lime, basil, tonic and sea salt', price: 295 },
      { name: 'Roasted Pineapple Swizzle', desc: 'Pineapple, tamarind, chilli and soda', price: 325 },
      { name: 'Masala Cola', desc: 'House cola, toasted spice and fresh citrus', price: 245 },
    ],
  },
]
