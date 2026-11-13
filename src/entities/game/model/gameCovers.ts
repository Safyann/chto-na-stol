const covers = import.meta.glob<string>('../assets/covers/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getGameCover(gameId: string) {
  return covers[`../assets/covers/${gameId}.jpg`];
}
