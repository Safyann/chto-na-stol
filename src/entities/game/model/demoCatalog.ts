import { localDate } from '../../../shared/lib/date';
import { type Game, type Notes } from './game';

type DemoGame = Omit<Game, 'id' | 'demo' | 'lastPlayed' | 'notes'> & {
  daysAgo?: number;
  notes?: Notes;
};

const demoCatalog: DemoGame[] = [
  {
    title: 'Диксит',
    minPlayers: 3,
    maxPlayers: 8,
    minutes: 30,
    beginners: true,
    daysAgo: 170,
    art: 'moon',
    notes: {
      setup:
        'Поставьте фишки на старт, раздайте по шесть карт и выдайте каждому диск для голосования.',
      firstTurn:
        'Рассказчик даёт ассоциацию к одной из своих карт. Остальные тайно подбирают по карте под ту же ассоциацию. Перемешайте и откройте карты, затем проголосуйте за карту рассказчика.',
      reminder:
        'Рассказчику выгодно, чтобы его карту угадали только некоторые игроки. За свою карту голосовать нельзя.',
    },
  },
  {
    title: 'Just One',
    minPlayers: 3,
    maxPlayers: 7,
    minutes: 20,
    beginners: true,
    daysAgo: 8,
    art: 'words',
    notes: {
      setup: 'Раздайте подставки и маркеры. Перемешайте карты и соберите колоду из 13 карт.',
      firstTurn:
        'Угадывающий ставит карту словом к остальным и выбирает номер. Каждый другой игрок записывает одну подсказку. Сверьте подсказки, затем покажите оставшиеся угадывающему.',
      reminder: 'Все экземпляры совпавшей подсказки убираются. У угадывающего одна попытка.',
    },
  },
  {
    title: 'Лоскутное королевство',
    minPlayers: 2,
    maxPlayers: 4,
    minutes: 15,
    beginners: true,
    daysAgo: 21,
    art: 'tiles',
    notes: {
      setup:
        'Выдайте каждому стартовый квадрат, замок и короля. Для первой линии выложите домино по возрастанию номеров и переверните их.',
      firstTurn:
        'В случайном порядке поставьте королей на выбранные домино. В следующем раунде заберите своё домино и выберите новое. Начинает король на верхнем домино.',
      reminder:
        'Королевство должно помещаться в квадрат 5 × 5. Очки за область равны числу её клеток, умноженному на число корон в ней.',
    },
  },
  { title: 'Азул', minPlayers: 2, maxPlayers: 4, minutes: 45, beginners: true, daysAgo: 94 },
  {
    title: 'Билет на поезд: Европа',
    minPlayers: 2,
    maxPlayers: 5,
    minutes: 60,
    beginners: true,
    daysAgo: 120,
  },
  {
    title: 'Кодовые имена',
    minPlayers: 4,
    maxPlayers: 8,
    minutes: 15,
    beginners: true,
    daysAgo: 65,
  },
  { title: 'Роскошь', minPlayers: 2, maxPlayers: 4, minutes: 30, beginners: true },
  { title: '7 чудес', minPlayers: 3, maxPlayers: 7, minutes: 30, beginners: false, daysAgo: 36 },
  {
    title: 'Тайное послание',
    minPlayers: 2,
    maxPlayers: 6,
    minutes: 20,
    beginners: true,
    daysAgo: 3,
  },
  { title: 'Суши Go!', minPlayers: 2, maxPlayers: 5, minutes: 15, beginners: true, daysAgo: 14 },
  { title: 'Пандемия', minPlayers: 2, maxPlayers: 4, minutes: 45, beginners: false, daysAgo: 110 },
  { title: 'Пэчворк', minPlayers: 2, maxPlayers: 2, minutes: 30, beginners: true },
];

export function createDemoCollection(): Game[] {
  return demoCatalog.map(({ daysAgo, ...game }, index) => {
    const date = new Date();
    if (daysAgo) date.setDate(date.getDate() - daysAgo);

    return {
      ...game,
      id: `demo-${index + 1}`,
      demo: true,
      lastPlayed: daysAgo ? localDate(date) : '',
      notes: game.notes ?? {},
    };
  });
}
