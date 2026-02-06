export const manifest = {
  bundles: [
    {
      name: 'character-parts',
      assets: [
        { alias: 'mbody', src: 'assets/characters/basic_maleassetspng' },
        { alias: 'fbody', src: 'assets/characters/basic_femaleassetspng' },
        { alias: 'longhair', src: 'assets/characters/long_hairassetspng' },
        { alias: 'shorthair', src: 'assets/characters/short_hairassetspng' },
        { alias: 'shirt', src: 'assets/characters/basic_shirtsassetspng' },
        { alias: 'pants', src: 'assets/characters/basic_pantsassetspng' },
      ],
    },
    {
      name: 'maps',
      assets: [
        { alias: 'myRoom', src: 'assets/maps/my_roomassetspng' },
        {
          alias: 'bookConcert',
          src: 'assets/maps/book_concert_floorassetspng',
        },
        { alias: 'bookConcertTmj', src: 'assets/maps/book_concertassetstmj' },
        { alias: 'bookTalkBasic', src: 'assets/maps/book_talk_floorassetspng' },
        {
          alias: 'bookTalkScience',
          src: 'assets/maps/book_talk_floor_scienceassetspng',
        },
        {
          alias: 'bookTalkComic',
          src: 'assets/maps/book_talk_floor_comicassetspng',
        },
        { alias: 'bookTalkTmj', src: 'assets/maps/book_talk_floorassetstmj' },
        { alias: 'conference', src: 'assets/maps/conference_floorassetspng' },
        {
          alias: 'conferenceTmj',
          src: 'assets/maps/conference_floorassetstmj',
        },
        { alias: 'lobby', src: 'assets/maps/lobbyassetspng' },
        { alias: 'lobbyTmj', src: 'assets/maps/lobbyassetstmj' },
        { alias: 'readingFloor', src: 'assets/maps/reading_floorassetspng' },
        { alias: 'readingFloorTmj', src: 'assets/maps/reading_floorassetstmj' },
      ],
    },
    {
      name: 'images',
      assets: [
        { alias: 'login_bg', src: 'assets/images/login_bgassetspng' },
        { alias: 'logo', src: 'assets/images/logoassetspng' },
        { alias: 'signup_bg', src: 'assets/images/signup_bgassetspng' },
      ],
    },
    {
      name: 'video',
      assets: [],
    },
  ],
};
