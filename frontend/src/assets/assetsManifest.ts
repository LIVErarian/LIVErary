export const manifest = {
  bundles: [
    {
      name: 'character-parts',
      assets: [
        { alias: 'mbody', src: '/assets/characters/basic_male.png' },
        { alias: 'fbody', src: '/assets/characters/basic_female.png' },
        { alias: 'longhair', src: '/assets/characters/long_hair.png' },
        { alias: 'shorthair', src: '/assets/characters/short_hair.png' },
        { alias: 'shirt', src: '/assets/characters/basic_shirts.png' },
        { alias: 'pants', src: '/assets/characters/basic_pants.png' },
      ],
    },
    {
      name: 'maps',
      assets: [
        { alias: 'myRoom', src: '/assets/maps/my_room.png' },
        { alias: 'bookConcert', src: '/assets/maps/book_concert_floor.png' },
        { alias: 'bookConcertTmj', src: '/assets/maps/book_concert.tmj' },
        { alias: 'bookTalkBasic', src: '/assets/maps/book_talk_floor.png' },
        {
          alias: 'bookTalkScience',
          src: '/assets/maps/book_talk_floor_science.png',
        },
        {
          alias: 'bookTalkComic',
          src: '/assets/maps/book_talk_floor_comic.png',
        },
        { alias: 'bookTalkTmj', src: '/assets/maps/book_talk_floor.tmj' },
        { alias: 'conference', src: '/assets/maps/conference_floor.png' },
        { alias: 'conferenceTmj', src: '/assets/maps/conference_floor.tmj' },
        { alias: 'lobby', src: '/assets/maps/lobby.png' },
        { alias: 'lobbyTmj', src: '/assets/maps/lobby.tmj' },
        { alias: 'readingFloor', src: '/assets/maps/reading_floor.png' },
        { alias: 'readingFloorTmj', src: '/assets/maps/reading_floor.tmj' },
      ],
    },
  ],
};
