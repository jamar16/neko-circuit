import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// v5 calendar PNGs (served from /public/images/v5). Keep in sync with lib/constants.ts.
const IMAGES = {
  standard: '/images/v5/01.png',
  deluxe: '/images/v5/08.png',
  collector: '/images/v5/11.png',
  august: '/images/v5/09.png',
  november: '/images/v5/12.png',
  preorder: '/images/v5/06.png',
  about: '/images/v5/14.png',
  convention: 'https://cdn.abacus.ai/images/71b5499f-6182-4139-9fd5-965c69ce22bb.png',
  vendor: 'https://cdn.abacus.ai/images/39512e2b-1452-49cb-a8ad-ce3eead3aaa6.png',
};

async function main() {
  // Seed admin user
  const hashedPw = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', name: 'Admin', password: hashedPw, role: 'admin' },
  });

  // Products
  const products = [
    {
      sku: 'NC-CAL-STD-2026',
      name: 'Standard Edition',
      description: 'Premium 12-month wall calendar with original anime art, 39+ convention dates, 75+ character birthdays, and Japanese holidays.',
      price: 24.99,
      preOrderPrice: 22.99,
      image: IMAGES.standard,
      tier: 'standard',
      features: JSON.stringify(['12 original anime art prints', '47+ Midwest convention dates', '75+ character birthdays', 'QR digital calendar sync', 'Moon phases', 'Con tip of the month']),
      limitedEdition: false,
      sortOrder: 1,
    },
    {
      sku: 'NC-CAL-DLX-2026',
      name: 'Deluxe Edition',
      description: 'Everything in Standard plus vinyl sticker sheet, exclusive 13th art print, and convention survival checklist.',
      price: 44.99,
      preOrderPrice: 36.99,
      image: IMAGES.deluxe,
      tier: 'deluxe',
      features: JSON.stringify(['Everything in Standard', '24 die-cut vinyl stickers', 'Exclusive All-Stars art print', 'Convention survival checklist', 'Branded tissue wrap packaging']),
      limitedEdition: false,
      sortOrder: 2,
    },
    {
      sku: 'NC-CAL-PRM-2026',
      name: 'Premium Magnetic Edition',
      description: 'The collector\'s tier. Magnetic backing, gold foil stamping, mini art book, numbered certificate. Limited to 200 units.',
      price: 84.99,
      preOrderPrice: 69.99,
      image: IMAGES.collector,
      tier: 'premium',
      features: JSON.stringify(['Everything in Deluxe', 'Magnetic fridge/locker backing', 'Gold foil stamped cover', '16-page mini art book', 'Numbered certificate', 'Holographic seal packaging']),
      limitedEdition: true,
      maxUnits: 200,
      sortOrder: 3,
    },
  ];

  // Deactivate retired placeholder products (Digital Sync, Stickers, Art Print, Bundles)
  const retiredSkus = ['NC-DIGI-2026', 'NC-STK-2026', 'NC-PRT-ALLSTAR-2026', 'NC-BDL-START-2026', 'NC-BDL-SUPER-2026', 'NC-BDL-ULT-2026'];
  await prisma.product.updateMany({ where: { sku: { in: retiredSkus } }, data: { active: false } });

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { ...p },
      create: { ...p },
    });
  }

  // Conventions — 2026 Midwest (MI, IL, IN, OH, WI, MN, MO, KY, IA ONLY)
  // ✅ = web-verified 2026 date   ⚠️ = unverified → dates set to null
  // Removed: Shuto Con (defunct 2019), Ikasucon (inactive 2017), Anime Nebraskon (NE out of scope)
  const conventions: Array<{name:string; city:string; state:string; venue:string; startDate:string|null; endDate:string|null; attendance:number; website:string|null; featured:boolean; type?:string|null; description?:string|null}> = [
    // ── CONFIRMED ──
    { name: 'Anime-Zap!', city: 'East Peoria', state: 'IL', venue: 'Embassy Suites East Peoria', startDate: '2026-01-09', endDate: '2026-01-11', attendance: 3000, website: null, featured: false },                      // ✅ animecons.com
    { name: 'Isshocon', city: 'Ypsilanti', state: 'MI', venue: 'Ann Arbor Marriott Ypsilanti', startDate: '2026-01-23', endDate: '2026-01-25', attendance: 2000, website: null, featured: false },                         // ✅ animecons.com
    { name: 'Ohayocon', city: 'Dayton', state: 'OH', venue: 'Dayton Convention Center', startDate: '2026-01-30', endDate: '2026-02-01', attendance: 15000, website: null, featured: true },                                // ✅ fancons.com
    { name: 'UI-Con', city: 'Champaign', state: 'IL', venue: 'Illini Union', startDate: '2026-01-30', endDate: '2026-01-31', attendance: 1500, website: null, featured: false },                                           // ✅ animecons.com
    { name: 'Anime Crossroads', city: 'Plainfield', state: 'IN', venue: 'Embassy Suites Plainfield', startDate: '2026-02-20', endDate: '2026-02-22', attendance: 5000, website: null, featured: false },                   // ✅ eventbrite
    { name: 'Anime Milwaukee', city: 'Milwaukee', state: 'WI', venue: 'Baird Center', startDate: '2026-03-06', endDate: '2026-03-08', attendance: 10000, website: null, featured: false },                                 // ✅ animemilwaukee.org
    { name: 'C2E2', city: 'Chicago', state: 'IL', venue: 'McCormick Place', startDate: '2026-03-27', endDate: '2026-03-29', attendance: 90000, website: 'https://www.c2e2.com', featured: true },                          // ✅ c2e2.com
    { name: 'Anime Detour', city: 'Minneapolis', state: 'MN', venue: 'DoubleTree by Hilton', startDate: '2026-03-27', endDate: '2026-03-29', attendance: 4000, website: null, featured: false },                           // ✅ animedetour.com
    { name: 'Astronomicon', city: 'Ypsilanti', state: 'MI', venue: 'Ann Arbor Marriott Ypsilanti', startDate: '2026-04-10', endDate: '2026-04-12', attendance: 5000, website: null, featured: false },                     // ✅ fancons.com
    { name: 'No Brand Con', city: 'Eau Claire', state: 'WI', venue: 'Lismore Hotel', startDate: '2026-05-01', endDate: '2026-05-03', attendance: 2500, website: null, featured: false },                                   // ✅ nobrandcon.org
    { name: 'ACen (Anime Central)', city: 'Rosemont', state: 'IL', venue: 'Donald E. Stephens Convention Center', startDate: '2026-05-15', endDate: '2026-05-17', attendance: 35000, website: 'https://www.acen.org', featured: true }, // ✅ acen.org
    { name: 'Colossalcon Prime', city: 'Sandusky', state: 'OH', venue: 'Kalahari Resorts', startDate: '2026-05-27', endDate: '2026-05-31', attendance: 20000, website: 'https://colossalconprime.com', featured: true },    // ✅ colossalconprime.com
    { name: 'Anime Midwest', city: 'Rosemont', state: 'IL', venue: 'Donald E. Stephens Convention Center', startDate: '2026-07-03', endDate: '2026-07-05', attendance: 15000, website: null, featured: true },             // ✅ animemidwest.com
    { name: 'Louisville Anime-Fest', city: 'Jeffersontown', state: 'KY', venue: 'Triple Crown Pavilion', startDate: '2026-07-12', endDate: '2026-07-12', attendance: 3000, website: null, featured: false },                // ✅ verified 1-day event
    { name: 'Dokidokon', city: 'Kalamazoo', state: 'MI', venue: 'Radisson Plaza Hotel at Kalamazoo Center', startDate: '2026-07-17', endDate: '2026-07-19', attendance: 3000, website: null, featured: false },                                // ✅ dokidokon.org
    { name: 'Gen Con', city: 'Indianapolis', state: 'IN', venue: 'Indiana Convention Center', startDate: '2026-07-30', endDate: '2026-08-02', attendance: 70000, website: 'https://www.gencon.com', featured: true },       // ✅ gencon.com
    { name: 'Youmacon', city: 'Detroit', state: 'MI', venue: 'Huntington Place', startDate: '2026-10-29', endDate: '2026-11-01', attendance: 25000, website: 'https://www.youmacon.com', featured: true },                 // ✅ youmacon.com
    { name: 'Colossalcon North', city: 'Wisconsin Dells', state: 'WI', venue: 'Kalahari Resorts Wisconsin Dells', startDate: '2026-11-20', endDate: '2026-11-22', attendance: 8000, website: 'https://www.colossalcon.com', featured: false }, // ✅ tickettailor
    // ── UNVERIFIED (dates NULL — on watchlist) ──
    { name: 'Zipcon', city: 'Akron', state: 'OH', venue: 'University of Akron Student Union', startDate: null, endDate: null, attendance: 1500, website: null, featured: false },
    { name: 'Indiana Comic Con', city: 'Indianapolis', state: 'IN', venue: 'Indiana Convention Center', startDate: null, endDate: null, attendance: 30000, website: null, featured: true },
    { name: 'Shoufu-Con', city: 'Lansing', state: 'MI', venue: 'Lansing Center', startDate: null, endDate: null, attendance: 2000, website: null, featured: false },
    { name: 'Motor City Comic Con', city: 'Novi', state: 'MI', venue: 'Vibe Credit Union Showplace', startDate: null, endDate: null, attendance: 50000, website: null, featured: false },
    { name: 'Collect-A-Con Chicago', city: 'Rosemont', state: 'IL', venue: 'Donald E. Stephens Convention Center', startDate: null, endDate: null, attendance: 10000, website: null, featured: false },
    { name: 'AniMinneapolis', city: 'Minneapolis', state: 'MN', venue: 'Hyatt Regency Minneapolis', startDate: null, endDate: null, attendance: 5000, website: null, featured: false },
    { name: 'ConComics Indy', city: 'Indianapolis', state: 'IN', venue: 'Wyndham Indianapolis West', startDate: null, endDate: null, attendance: 3000, website: null, featured: false },
    { name: 'Anime Ink Con', city: 'Cincinnati', state: 'OH', venue: 'Duke Energy Convention Center', startDate: null, endDate: null, attendance: 4000, website: null, featured: false },
    { name: 'Grand Rapids Comic Con', city: 'Grand Rapids', state: 'MI', venue: 'DeVos Place', startDate: null, endDate: null, attendance: 12000, website: null, featured: false },
    { name: 'JAFAX', city: 'Grand Rapids', state: 'MI', venue: 'DeVos Place Convention Center', startDate: '2026-06-05', endDate: '2026-06-07', attendance: 4000, website: null, featured: false },
    { name: 'Animate! Columbus', city: 'Columbus', state: 'OH', venue: 'TBA', startDate: '2026-06-12', endDate: '2026-06-14', attendance: 0, website: null, featured: false },
    { name: 'Cosplay Picnic', city: 'Detroit', state: 'MI', venue: 'Detroit Riverfront', startDate: '2026-06-06', endDate: '2026-06-06', attendance: 0, website: null, featured: false },
    { name: 'MiAnime', city: 'Novi', state: 'MI', venue: 'Vibe Credit Union Showplace', startDate: '2026-08-01', endDate: '2026-08-02', attendance: 0, website: 'https://michigananime.com', featured: false },
    { name: 'Ozokucon', city: 'Port Huron', state: 'MI', venue: 'Blue Water Convention Center', startDate: '2026-08-28', endDate: '2026-08-30', attendance: 0, website: 'https://ozokucon.com', featured: false },
    { name: 'Mythic Forge Gaming', city: 'Madison Heights', state: 'MI', venue: 'Mythic Forge Gaming', startDate: null, endDate: null, attendance: 0, website: null, featured: false, type: 'Tournament', description: 'Weekly Thursday TCG nights — Pokemon, MTG, Sorcery, One Piece' },
    { name: 'Gotta Gatcha', city: 'Detroit', state: 'MI', venue: '', startDate: null, endDate: null, attendance: 0, website: null, featured: false, type: 'Pop-Up' },
    { name: 'Glotaku', city: 'Detroit', state: 'MI', venue: '', startDate: null, endDate: null, attendance: 0, website: null, featured: false, type: 'Meetup' },
    { name: 'Matsuricon', city: 'Columbus', state: 'OH', venue: 'Hyatt Regency Columbus', startDate: null, endDate: null, attendance: 6000, website: null, featured: false },
    { name: 'Otakon', city: 'Columbus', state: 'OH', venue: 'Greater Columbus Convention Center', startDate: null, endDate: null, attendance: 30000, website: null, featured: false },
    { name: 'Wizard World Chicago', city: 'Chicago', state: 'IL', venue: 'Donald E. Stephens Convention Center', startDate: null, endDate: null, attendance: 40000, website: null, featured: false },
    { name: 'KawaiiKon Midwest', city: 'St. Louis', state: 'MO', venue: 'America\'s Center', startDate: null, endDate: null, attendance: 5000, website: null, featured: false },
    { name: 'Nan Desu Kan', city: 'Chicago', state: 'IL', venue: 'Sheraton Grand Chicago', startDate: null, endDate: null, attendance: 3000, website: null, featured: false },
    { name: 'Animarathon', city: 'Bowling Green', state: 'OH', venue: 'BGSU Student Union', startDate: null, endDate: null, attendance: 2000, website: null, featured: false },
    { name: 'Kalamazoo Comic Con', city: 'Kalamazoo', state: 'MI', venue: 'Kalamazoo County Expo Center', startDate: null, endDate: null, attendance: 8000, website: null, featured: false },
    { name: 'Midwest GameFest', city: 'Milwaukee', state: 'WI', venue: 'Wisconsin Center', startDate: null, endDate: null, attendance: 6000, website: null, featured: false },
    { name: 'Archon', city: 'St. Louis', state: 'MO', venue: 'Gateway Convention Center', startDate: null, endDate: null, attendance: 3000, website: null, featured: false },
    { name: 'Michigan Comic Con', city: 'Novi', state: 'MI', venue: 'Vibe Credit Union Showplace', startDate: null, endDate: null, attendance: 30000, website: null, featured: false },
    { name: 'Tokyo in Tulsa Midwest', city: 'Chicago', state: 'IL', venue: 'Hilton Chicago', startDate: null, endDate: null, attendance: 4000, website: null, featured: false },
    { name: 'Hallowcon', city: 'Cleveland', state: 'OH', venue: 'Cleveland Convention Center', startDate: null, endDate: null, attendance: 8000, website: null, featured: false },
    { name: 'WindyCon', city: 'Chicago', state: 'IL', venue: 'Westin Lombard', startDate: null, endDate: null, attendance: 2000, website: null, featured: false },
    { name: 'Detroit Fanfare', city: 'Dearborn', state: 'MI', venue: 'Ford Community & Performing Arts Center', startDate: null, endDate: null, attendance: 5000, website: null, featured: false },
    { name: 'Con Alt Delete', city: 'Louisville', state: 'KY', venue: 'Louisville Marriott Downtown', startDate: null, endDate: null, attendance: 3000, website: null, featured: false },
    { name: 'Midwest FurFest', city: 'Rosemont', state: 'IL', venue: 'Donald E. Stephens Convention Center', startDate: null, endDate: null, attendance: 14000, website: null, featured: false },
    { name: 'Galaxy Con Columbus', city: 'Columbus', state: 'OH', venue: 'Greater Columbus Convention Center', startDate: null, endDate: null, attendance: 20000, website: null, featured: false },
    { name: 'IKKiCON Midwest', city: 'Chicago', state: 'IL', venue: 'Hilton Chicago', startDate: null, endDate: null, attendance: 3000, website: null, featured: false },
    { name: 'Holiday Matsuri Midwest', city: 'Indianapolis', state: 'IN', venue: 'Indiana Convention Center', startDate: null, endDate: null, attendance: 8000, website: null, featured: false },
  ];

  // Rename Colossalcon → Colossalcon Prime (if old record exists)
  const oldColossalcon = await prisma.convention.findFirst({ where: { name: 'Colossalcon' } });
  if (oldColossalcon) {
    await prisma.convention.update({ where: { id: oldColossalcon.id }, data: { name: 'Colossalcon Prime' } });
  }
  // Rename Louisville Anime Day → Louisville Anime-Fest
  const oldLouisville = await prisma.convention.findFirst({ where: { name: 'Louisville Anime Day' } });
  if (oldLouisville) {
    await prisma.convention.update({ where: { id: oldLouisville.id }, data: { name: 'Louisville Anime-Fest' } });
  }
  // Remove defunct / out-of-scope conventions
  await prisma.convention.deleteMany({ where: { name: { in: ['Shuto Con', 'Ikasucon', 'Anime Nebraskon'] } } });
  // Update Colossalcon vendor reference
  await prisma.vendor.updateMany({ where: { convention: 'Colossalcon' }, data: { convention: 'Colossalcon Prime' } });

  for (const c of conventions) {
    const existing = await prisma.convention.findFirst({ where: { name: c.name } });
    const sd = c.startDate ? new Date(c.startDate) : null;
    const ed = c.endDate ? new Date(c.endDate) : null;
    if (existing) {
      await prisma.convention.update({
        where: { id: existing.id },
        data: {
          city: c.city,
          state: c.state,
          venue: c.venue,
          startDate: sd,
          endDate: ed,
          attendance: c.attendance,
          website: c.website ?? existing.website,
          featured: c.featured,
          ...(c.type !== undefined ? { type: c.type } : {}),
          ...(c.description !== undefined ? { description: c.description } : {}),
        },
      });
    } else {
      await prisma.convention.create({
        data: {
          name: c.name,
          city: c.city,
          state: c.state,
          venue: c.venue,
          startDate: sd,
          endDate: ed,
          attendance: c.attendance,
          website: c.website,
          featured: c.featured,
          ...(c.type !== undefined ? { type: c.type } : {}),
          ...(c.description !== undefined ? { description: c.description } : {}),
        },
      });
    }
  }

  // Sample Vendors
  const vendors = [
    { name: 'KawaiiCraft Studio', boothName: 'KawaiiCraft', convention: 'Youmacon', boothNumber: 'AA-42', dates: 'Oct 29 - Nov 1, 2026', category: 'Artist Alley', instagram: '@kawaiicraftstudio', approved: true },
    { name: 'NeonBlade Cosplay', boothName: 'NeonBlade Props', convention: 'Youmacon', boothNumber: 'D-112', dates: 'Oct 29 - Nov 1, 2026', category: 'Cosplay Props', instagram: '@neonbladecosplay', approved: true },
    { name: 'Sakura Prints Co', boothName: 'Sakura Prints', convention: 'ACen', boothNumber: 'AA-87', dates: 'May 15-17, 2026', category: 'Prints & Posters', instagram: '@sakuraprintsco', website: null, approved: true },
    { name: 'Mochi Mochi Kitchen', boothName: 'Mochi Kitchen', convention: 'Anime Midwest', boothNumber: 'F-03', dates: 'Jul 3-5, 2026', category: 'Food Vendor', instagram: '@mochimochikitchen', approved: true },
    { name: 'Kitsune Threads', boothName: 'Kitsune Threads', convention: 'Colossalcon Prime', boothNumber: 'D-201', dates: 'May 27-31, 2026', category: 'Clothing & Accessories', instagram: '@kitsunethreads', website: null, approved: true },
    { name: 'ChubbyPlush Studio', boothName: 'ChubbyPlush', convention: 'Ohayocon', boothNumber: 'AA-15', dates: 'Jan 30 - Feb 1, 2026', category: 'Plushies & Figures', instagram: '@chubbyplushstudio', approved: true },
    { name: 'RetroManga Books', boothName: 'RetroManga', convention: 'C2E2', boothNumber: 'D-305', dates: 'Mar 27-29, 2026', category: "Dealer's Room", instagram: '@retromangabooks', approved: true },
    { name: 'PixelPaw Designs', boothName: 'PixelPaw', convention: 'Gen Con', boothNumber: 'AA-65', dates: 'Jul 30 - Aug 2, 2026', category: 'Artist Alley', instagram: '@pixelpawdesigns', approved: true },
    { name: 'TechnoTanuki', boothName: 'TechnoTanuki Merch', convention: 'Youmacon', boothNumber: 'D-88', dates: 'Oct 29 - Nov 1, 2026', category: 'Clothing & Accessories', instagram: '@technotanuki', approved: true },
    { name: 'Neko Circuit', boothName: 'Neko Circuit Booth', convention: 'Youmacon', boothNumber: 'AA-01', dates: 'Oct 29 - Nov 1, 2026', category: 'Prints & Posters', instagram: '@neko313circuit', approved: true },
  ];

  for (const v of vendors) {
    const existing = await prisma.vendor.findFirst({ where: { name: v.name, convention: v.convention } });
    if (!existing) {
      await prisma.vendor.create({ data: v });
    }
  }

  // ── Michigan verified events (MIGeekScene + comiconomicon cross-verified) ──
  const michiganEvents = [
    // Conventions (type null → appear on main /conventions list)
    { name: 'Capital City Comic Con', city: 'Lansing', state: 'MI', venue: 'Lansing Center', startDate: new Date('2026-07-10'), endDate: new Date('2026-07-12'), type: null, attendance: 0 },
    { name: 'Really Cool Comic Con', city: 'Flint', state: 'MI', venue: 'Dort Financial Center', startDate: new Date('2026-07-18'), endDate: new Date('2026-07-19'), type: null, attendance: 0 },
    { name: 'Video Games and Vinyl', city: 'Ann Arbor', state: 'MI', venue: 'Sheraton Ann Arbor', startDate: new Date('2026-08-23'), endDate: new Date('2026-08-23'), type: null, attendance: 0 },
    { name: 'Detroit Horror Con', city: 'Waterford Township', state: 'MI', venue: 'Oakland Expo Center', startDate: new Date('2026-08-28'), endDate: new Date('2026-08-30'), type: null, attendance: 0 },
    { name: 'Michigan Retro Game Expo', city: 'Kalamazoo', state: 'MI', venue: 'Delta Hotels Kalamazoo Conf Center', startDate: new Date('2026-08-29'), endDate: new Date('2026-08-29'), type: null, attendance: 0 },
    { name: 'GrandCon', city: 'Grand Rapids', state: 'MI', venue: 'DeVos Performance Hall', startDate: new Date('2026-09-04'), endDate: new Date('2026-09-06'), type: null, attendance: 0 },
    { name: 'Monroe Comic Con', city: 'Monroe', state: 'MI', venue: 'FMB Expo Center', startDate: new Date('2026-09-11'), endDate: new Date('2026-09-12'), type: null, attendance: 0 },
    { name: 'Detroit Retro Video Game Show', city: 'Southfield', state: 'MI', venue: 'Southfield Pavilion', startDate: new Date('2026-11-07'), endDate: new Date('2026-11-07'), type: null, attendance: 0 },
    // Culture / Festival (type "Festival" → filtered from main list)
    { name: 'Detroit Festival of Books', city: 'Detroit', state: 'MI', venue: 'Eastern Market Shed 5', startDate: new Date('2026-07-19'), endDate: new Date('2026-07-19'), type: 'Festival', attendance: 0 },
    { name: 'Fantastical Fairytale Festival', city: 'Flint', state: 'MI', venue: 'Crossroads Village & Huckleberry Railroad', startDate: new Date('2026-07-25'), endDate: new Date('2026-07-26'), type: 'Festival', attendance: 0 },
    { name: 'Mid-Michigan Renaissance Festival', city: 'Vassar', state: 'MI', venue: "Mid-Michigan Renaissance Festival's Enchanted Forest", startDate: new Date('2026-07-11'), endDate: new Date('2026-07-26'), type: 'Festival', attendance: 0, description: 'Multiple themed weekends: Jul 11-12, Jul 18-19, Jul 25-26. One festival, three weekends of medieval mayhem at the Enchanted Forest.' },
    // Music (type "Music" → filtered from main list)
    { name: 'Nerdivation Nerdcore Music Showcase', city: 'Detroit', state: 'MI', venue: 'Tangent Gallery', startDate: new Date('2026-06-27'), endDate: new Date('2026-06-27'), type: 'Music', attendance: 0 },
  ];

  for (const evt of michiganEvents) {
    await prisma.convention.upsert({
      where: { id: (await prisma.convention.findFirst({ where: { name: evt.name } }))?.id ?? 'nonexistent' },
      update: { city: evt.city, state: evt.state, venue: evt.venue, startDate: evt.startDate, endDate: evt.endDate, type: evt.type, ...(evt.description ? { description: evt.description } : {}) },
      create: { name: evt.name, city: evt.city, state: evt.state, venue: evt.venue, startDate: evt.startDate, endDate: evt.endDate, type: evt.type, attendance: evt.attendance, ...(evt.description ? { description: evt.description } : {}) },
    });
    console.log(`  ✓ Upserted: ${evt.name}`);
  }

  // Characters are now seeded via scripts/seedCharacters.ts

  console.log('Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
