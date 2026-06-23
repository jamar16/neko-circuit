import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHARACTERS = [
  {
    name: 'Naruto Uzumaki',
    series: 'Naruto / Naruto Shippuden',
    birthday: '10-10',
    description: 'The Seventh Hokage of the Hidden Leaf Village. Never gave up.',
    voiceActors: [
      { language: 'Japanese', name: 'Junko Takeuchi', profileUrl: 'https://www.officetakeuchi.com/', agency: 'Office Takeuchi' },
      { language: 'English', name: 'Maile Flanagan', profileUrl: 'https://www.imdb.com/name/nm1423081/', agency: 'VIZ Media' },
      { language: 'Spanish (Latin America)', name: 'Eduardo Garza', profileUrl: 'https://www.imdb.com/name/nm0308388/', agency: null },
    ],
  },
  {
    name: 'Sasuke Uchiha',
    series: 'Naruto / Naruto Shippuden',
    birthday: '07-23',
    description: 'Last survivor of the Uchiha clan. Walked his own path.',
    voiceActors: [
      { language: 'Japanese', name: 'Noriaki Sugiyama', profileUrl: 'https://www.imdb.com/name/nm1719886/', agency: 'Grick' },
      { language: 'English', name: 'Yuri Lowenthal', profileUrl: 'https://yurilowenthal.com/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Miguel Ángel Ruiz', profileUrl: 'https://www.imdb.com/name/nm0750232/', agency: null },
    ],
  },
  {
    name: 'Monkey D. Luffy',
    series: 'One Piece',
    birthday: '05-05',
    description: 'Captain of the Straw Hat Pirates. King of the Pirates.',
    voiceActors: [
      { language: 'Japanese', name: 'Mayumi Tanaka', profileUrl: 'https://www.imdb.com/name/nm0849630/', agency: 'Mausu Promotion' },
      { language: 'English', name: 'Colleen Clinkenbeard', profileUrl: 'https://www.imdb.com/name/nm1423490/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Carlos Segundo', profileUrl: 'https://www.imdb.com/name/nm0781842/', agency: null },
    ],
  },
  {
    name: 'Roronoa Zoro',
    series: 'One Piece',
    birthday: '11-11',
    description: "The world's greatest swordsman — in progress.",
    voiceActors: [
      { language: 'Japanese', name: 'Kazuya Nakai', profileUrl: 'https://www.imdb.com/name/nm0619503/', agency: 'Axl One' },
      { language: 'English', name: 'Christopher Sabat', profileUrl: 'https://www.imdb.com/name/nm0754549/', agency: 'OC UK' },
      { language: 'Spanish (Latin America)', name: 'Alejandro Villeli', profileUrl: 'https://www.imdb.com/name/nm0898659/', agency: null },
    ],
  },
  {
    name: 'Izuku Midoriya',
    series: 'My Hero Academia',
    birthday: '07-15',
    description: 'The Symbol of Hope. Quirkless boy who became the greatest hero.',
    voiceActors: [
      { language: 'Japanese', name: 'Daiki Yamashita', profileUrl: 'https://www.imdb.com/name/nm6088553/', agency: 'Pu-Lu-Ka' },
      { language: 'English', name: 'Justin Briner', profileUrl: 'https://www.imdb.com/name/nm5700891/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Michel Maza', profileUrl: 'https://www.imdb.com/name/nm0561028/', agency: null },
    ],
  },
  {
    name: 'Katsuki Bakugo',
    series: 'My Hero Academia',
    birthday: '04-20',
    description: 'Explosive in every sense. Competing to be number one.',
    voiceActors: [
      { language: 'Japanese', name: 'Nobuhiko Okamoto', profileUrl: 'https://www.imdb.com/name/nm4071560/', agency: 'Pro-Fit' },
      { language: 'English', name: 'Clifford Chapin', profileUrl: 'https://www.imdb.com/name/nm3591490/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Arturo Castañeda', profileUrl: 'https://www.imdb.com/name/nm0144694/', agency: null },
    ],
  },
  {
    name: 'Shoto Todoroki',
    series: 'My Hero Academia',
    birthday: '01-11',
    description: "Half-cold, half-hot. Walked out of his father's shadow.",
    voiceActors: [
      { language: 'Japanese', name: 'Yuki Kaji', profileUrl: 'https://www.imdb.com/name/nm4113802/', agency: 'Integrity' },
      { language: 'English', name: 'David Matranga', profileUrl: 'https://www.imdb.com/name/nm0558920/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Alan Fernando Velázquez', profileUrl: 'https://www.imdb.com/name/nm6303566/', agency: null },
    ],
  },
  {
    name: 'Tanjiro Kamado',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    birthday: '07-14',
    description: 'A kind soul who became a Demon Slayer to save his sister.',
    voiceActors: [
      { language: 'Japanese', name: 'Natsuki Hanae', profileUrl: 'https://www.imdb.com/name/nm5736478/', agency: 'S-INCLINE' },
      { language: 'English', name: 'Zach Aguilar', profileUrl: 'https://www.imdb.com/name/nm7083513/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Sebastián Llapur', profileUrl: 'https://www.imdb.com/name/nm4318940/', agency: null },
    ],
  },
  {
    name: 'Nezuko Kamado',
    series: 'Demon Slayer: Kimetsu no Yaiba',
    birthday: '12-28',
    description: 'A demon who never lost her humanity. Protects her brother.',
    voiceActors: [
      { language: 'Japanese', name: 'Akari Kitō', profileUrl: 'https://www.imdb.com/name/nm9052413/', agency: '81 Produce' },
      { language: 'English', name: 'Abby Trott', profileUrl: 'https://www.imdb.com/name/nm8346346/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Analiz Sánchez', profileUrl: 'https://www.imdb.com/name/nm9159032/', agency: null },
    ],
  },
  {
    name: 'Levi Ackerman',
    series: 'Attack on Titan',
    birthday: '12-25',
    description: "Humanity's strongest soldier. Clean freak. Absolute unit.",
    voiceActors: [
      { language: 'Japanese', name: 'Hiroshi Kamiya', profileUrl: 'https://www.imdb.com/name/nm1454598/', agency: 'Ares' },
      { language: 'English', name: 'Matthew Mercer', profileUrl: 'https://matthewmercervo.com/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Miguel Ángel Leal', profileUrl: 'https://www.imdb.com/name/nm2670524/', agency: null },
    ],
  },
  {
    name: 'Eren Yeager',
    series: 'Attack on Titan',
    birthday: '03-30',
    description: "Freedom fighter. Titan shifter. The story's complicated.",
    voiceActors: [
      { language: 'Japanese', name: 'Yuki Kaji', profileUrl: 'https://www.imdb.com/name/nm4113802/', agency: 'Integrity' },
      { language: 'English', name: 'Bryce Papenbrook', profileUrl: 'https://www.imdb.com/name/nm3504056/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Alejandro Orozco', profileUrl: 'https://www.imdb.com/name/nm0651033/', agency: null },
    ],
  },
  {
    name: 'Mikasa Ackerman',
    series: 'Attack on Titan',
    birthday: '02-10',
    description: 'The best soldier of her generation. Carries everything quietly.',
    voiceActors: [
      { language: 'Japanese', name: 'Yui Ishikawa', profileUrl: 'https://www.imdb.com/name/nm5065478/', agency: 'Production Baobab' },
      { language: 'English', name: 'Trina Nishimura', profileUrl: 'https://www.imdb.com/name/nm2670517/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Gaby Ugarte', profileUrl: 'https://www.imdb.com/name/nm4362208/', agency: null },
    ],
  },
  {
    name: 'Edward Elric',
    series: 'Fullmetal Alchemist: Brotherhood',
    birthday: '01-03',
    description: 'The Fullmetal Alchemist. Short in stature, enormous in heart.',
    voiceActors: [
      { language: 'Japanese', name: 'Romi Park', profileUrl: 'https://www.imdb.com/name/nm0662621/', agency: 'Aksent' },
      { language: 'English', name: 'Vic Mignogna', profileUrl: 'https://www.imdb.com/name/nm0586471/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Sebastián Llapur', profileUrl: 'https://www.imdb.com/name/nm4318940/', agency: null },
    ],
  },
  {
    name: 'Roy Mustang',
    series: 'Fullmetal Alchemist: Brotherhood',
    birthday: '01-29',
    description: 'The Flame Alchemist. Wants to become Führer to change the country.',
    voiceActors: [
      { language: 'Japanese', name: 'Shinichiro Miki', profileUrl: 'https://www.imdb.com/name/nm0587905/', agency: 'Axl One' },
      { language: 'English', name: 'Travis Willingham', profileUrl: 'https://www.imdb.com/name/nm1712851/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Irwin Daayán', profileUrl: 'https://www.imdb.com/name/nm0195131/', agency: null },
    ],
  },
  {
    name: 'L Lawliet',
    series: 'Death Note',
    birthday: '10-31',
    description: "The world's greatest detective. Sits strange. Thinks stranger.",
    voiceActors: [
      { language: 'Japanese', name: 'Kappei Yamaguchi', profileUrl: 'https://www.imdb.com/name/nm0945793/', agency: 'Grick' },
      { language: 'English', name: 'Alessandro Juliani', profileUrl: 'https://www.imdb.com/name/nm0432488/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Ricardo Mendoza', profileUrl: 'https://www.imdb.com/name/nm0579099/', agency: null },
    ],
  },
  {
    name: 'Light Yagami',
    series: 'Death Note',
    birthday: '02-28',
    description: 'Justice as he defined it. God of a new world — briefly.',
    voiceActors: [
      { language: 'Japanese', name: 'Mamoru Miyano', profileUrl: 'https://www.imdb.com/name/nm1867085/', agency: 'Atomic Monkey' },
      { language: 'English', name: 'Brad Swaile', profileUrl: 'https://www.imdb.com/name/nm0839706/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Víctor Ugarte', profileUrl: 'https://www.imdb.com/name/nm0880428/', agency: null },
    ],
  },
  {
    name: 'Usagi Tsukino / Sailor Moon',
    series: 'Sailor Moon',
    birthday: '06-30',
    description: 'The guardian of love and justice. Cried first, fought second, won always.',
    voiceActors: [
      { language: 'Japanese', name: 'Kotono Mitsuishi', profileUrl: 'https://www.imdb.com/name/nm0593175/', agency: 'Aoni Production' },
      { language: 'English', name: 'Stephanie Sheh', profileUrl: 'https://www.imdb.com/name/nm1423491/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Rocío Garcel', profileUrl: 'https://www.imdb.com/name/nm0306484/', agency: null },
    ],
  },
  {
    name: 'Gon Freecss',
    series: 'Hunter x Hunter',
    birthday: '05-05',
    description: 'Cheerful, fearless, and occasionally terrifying. Wants to find his father.',
    voiceActors: [
      { language: 'Japanese', name: 'Megumi Han', profileUrl: 'https://www.imdb.com/name/nm4432694/', agency: 'Amuleto' },
      { language: 'English', name: 'Erica Mendez', profileUrl: 'https://www.imdb.com/name/nm5700838/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Irwin Daayán', profileUrl: 'https://www.imdb.com/name/nm0195131/', agency: null },
    ],
  },
  {
    name: 'Killua Zoldyck',
    series: 'Hunter x Hunter',
    birthday: '07-07',
    description: "Assassin by training. Gon's best friend by choice. The harder path.",
    voiceActors: [
      { language: 'Japanese', name: 'Mariya Ise', profileUrl: 'https://www.imdb.com/name/nm3048501/', agency: 'Aoni Production' },
      { language: 'English', name: 'Cristina Vee', profileUrl: 'https://cristinavee.com/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Karla Díaz', profileUrl: 'https://www.imdb.com/name/nm5155791/', agency: null },
    ],
  },
  {
    name: 'Spike Spiegel',
    series: 'Cowboy Bebop',
    birthday: '06-26',
    description: 'See you space cowboy. Whatever happens, happens.',
    voiceActors: [
      { language: 'Japanese', name: 'Koichi Yamadera', profileUrl: 'https://www.imdb.com/name/nm0945541/', agency: 'Sigma Seven' },
      { language: 'English', name: 'Steve Blum', profileUrl: 'https://steveblum.com/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Eduardo Garza', profileUrl: 'https://www.imdb.com/name/nm0308388/', agency: null },
    ],
  },
  {
    name: 'Ichigo Kurosaki',
    series: 'Bleach',
    birthday: '07-15',
    description: 'Soul Reaper, Hollow, Quincy. He protects what matters.',
    voiceActors: [
      { language: 'Japanese', name: 'Masakazu Morita', profileUrl: 'https://www.imdb.com/name/nm1040091/', agency: 'Grick' },
      { language: 'English', name: 'Johnny Yong Bosch', profileUrl: 'https://www.imdb.com/name/nm0099382/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Irwin Daayán', profileUrl: 'https://www.imdb.com/name/nm0195131/', agency: null },
    ],
  },
  {
    name: 'Rukia Kuchiki',
    series: 'Bleach',
    birthday: '01-14',
    description: "The Soul Reaper who changed Ichigo's world. Became a Captain.",
    voiceActors: [
      { language: 'Japanese', name: 'Fumiko Orikasa', profileUrl: 'https://www.imdb.com/name/nm1388082/', agency: 'Aoni Production' },
      { language: 'English', name: 'Michelle Ruff', profileUrl: 'https://www.imdb.com/name/nm1423493/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Ana María Grey', profileUrl: 'https://www.imdb.com/name/nm1697350/', agency: null },
    ],
  },
  {
    name: 'Rem',
    series: 'Re:Zero − Starting Life in Another World',
    birthday: '02-02',
    description: "She loved him when he couldn't love himself. The internet never recovered.",
    voiceActors: [
      { language: 'Japanese', name: 'Inori Minase', profileUrl: 'https://www.imdb.com/name/nm6631977/', agency: "I'm Enterprise" },
      { language: 'English', name: 'Brianna Knickerbocker', profileUrl: 'https://www.imdb.com/name/nm6285671/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Belén Rodríguez', profileUrl: 'https://www.imdb.com/name/nm5797842/', agency: null },
    ],
  },
  {
    name: 'Itachi Uchiha',
    series: 'Naruto Shippuden',
    birthday: '06-09',
    description: "Bore everything alone so others wouldn't have to.",
    voiceActors: [
      { language: 'Japanese', name: 'Hideo Ishikawa', profileUrl: 'https://www.imdb.com/name/nm1365905/', agency: 'Sigma Seven' },
      { language: 'English', name: 'Crispin Freeman', profileUrl: 'https://crispinfreeman.com/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Óscar Flores', profileUrl: 'https://www.imdb.com/name/nm0282600/', agency: null },
    ],
  },
  {
    name: 'Asta',
    series: 'Black Clover',
    birthday: '10-04',
    description: 'Born with no magic. Became the Magic Emperor through sheer will.',
    voiceActors: [
      { language: 'Japanese', name: 'Gakuto Kajiwara', profileUrl: 'https://www.imdb.com/name/nm9438618/', agency: 'Ken Production' },
      { language: 'English', name: 'Dallas Reid', profileUrl: 'https://www.imdb.com/name/nm8376540/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Arturo Castañeda', profileUrl: 'https://www.imdb.com/name/nm0144694/', agency: null },
    ],
  },
  {
    name: 'Yuji Itadori',
    series: 'Jujutsu Kaisen',
    birthday: '03-20',
    description: 'Swallowed a cursed finger. Became the vessel for the King of Curses.',
    voiceActors: [
      { language: 'Japanese', name: 'Junya Enoki', profileUrl: 'https://www.imdb.com/name/nm9631948/', agency: '81 Produce' },
      { language: 'English', name: 'Adam McArthur', profileUrl: 'https://www.imdb.com/name/nm5700924/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Miguel Ángel Ruiz', profileUrl: 'https://www.imdb.com/name/nm0750232/', agency: null },
    ],
  },
  {
    name: 'Megumi Fushiguro',
    series: 'Jujutsu Kaisen',
    birthday: '12-22',
    description: 'Ten Shadows technique. Wants to save the right people.',
    voiceActors: [
      { language: 'Japanese', name: 'Yuma Uchida', profileUrl: 'https://www.imdb.com/name/nm8376543/', agency: 'Pro-Fit' },
      { language: 'English', name: 'Robbie Daymond', profileUrl: 'https://www.imdb.com/name/nm4714636/', agency: null },
      { language: 'Spanish (Latin America)', name: 'Alan Fernando Velázquez', profileUrl: 'https://www.imdb.com/name/nm6303566/', agency: null },
    ],
  },
  {
    name: 'Nobara Kugisaki',
    series: 'Jujutsu Kaisen',
    birthday: '08-07',
    description: 'Straw Doll Technique. Loves herself unapologetically.',
    voiceActors: [
      { language: 'Japanese', name: 'Asami Seto', profileUrl: 'https://www.imdb.com/name/nm5065487/', agency: 'Aoni Production' },
      { language: 'English', name: 'Anne Yatco', profileUrl: 'https://www.imdb.com/name/nm9399204/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Gaby Ugarte', profileUrl: 'https://www.imdb.com/name/nm4362208/', agency: null },
    ],
  },
  {
    name: 'Nami',
    series: 'One Piece',
    birthday: '07-03',
    description: 'Navigator of the Straw Hats. Stole from pirates to buy back her village.',
    voiceActors: [
      { language: 'Japanese', name: 'Akemi Okamura', profileUrl: 'https://www.imdb.com/name/nm0641363/', agency: 'Mausu Promotion' },
      { language: 'English', name: 'Luci Christian', profileUrl: 'https://www.imdb.com/name/nm1423489/', agency: 'Funimation' },
      { language: 'Spanish (Latin America)', name: 'Isabel Martiñón', profileUrl: 'https://www.imdb.com/name/nm0552547/', agency: null },
    ],
  },
  {
    name: 'Hisoka Morow',
    series: 'Hunter x Hunter',
    birthday: '06-06',
    description: 'The magician. Fights for the thrill. Deeply unsettling. Fan favorite.',
    voiceActors: [
      { language: 'Japanese', name: 'Daisuke Namikawa', profileUrl: 'https://www.imdb.com/name/nm1454599/', agency: 'Sigma Seven' },
      { language: 'English', name: 'Keith Silverstein', profileUrl: 'https://www.imdb.com/name/nm0799068/', agency: null },
      { language: 'Spanish (Latin America)', name: 'José Antonio Macías', profileUrl: 'https://www.imdb.com/name/nm0531570/', agency: null },
    ],
  },
];

async function main() {
  console.log('Clearing existing characters and voice actors...');
  await prisma.voiceActor.deleteMany({});
  await prisma.character.deleteMany({});

  let charCount = 0;
  let vaCount = 0;

  for (const ch of CHARACTERS) {
    const { voiceActors, ...charData } = ch;
    const created = await prisma.character.create({
      data: {
        ...charData,
        voiceActors: {
          create: voiceActors.map((va) => ({
            name: va.name,
            language: va.language,
            profileUrl: va.profileUrl ?? null,
            agency: va.agency ?? null,
          })),
        },
      },
      include: { voiceActors: true },
    });
    charCount++;
    vaCount += created.voiceActors.length;
  }

  console.log(`Seeded ${charCount} characters with ${vaCount} voice actors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
