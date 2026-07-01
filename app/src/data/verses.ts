/*
 * This file provides a local collection of Qur'an verses for DeenShield's
 * "Verse of the Day" feature.  Each entry contains the original Arabic
 * verse, a simple Latin‐character transliteration and an English
 * translation based on the Saheeh International translation.  The
 * transliteration is intended to help readers pronounce the Arabic more
 * easily, though it is only an approximation.  Themes are subjective
 * groupings such as discipline, focus, hope, gratitude and patience.
 *
 * NOTE: This is a partial list assembled as a prototype.  It does not
 * yet cover the entire Qur'an or reach the target of 150 unique verses,
 * but it demonstrates the intended structure and includes a range of
 * themes.  Duplicates have been avoided.
 */

export type DailyVerse = {
  /** A unique identifier in the format "surah:ayah" (e.g. "2:286"). */
  id: string;
  /** Numerical surah identifier. */
  surahNumber: number;
  /** English transliteration of the surah name. */
  surahName: string;
  /** Verse number within the surah. */
  ayah: number;
  /** Arabic text of the verse (including vowel marks). */
  arabic: string;
  /** Phonetic transliteration using Latin characters. */
  transliteration: string;
  /** An English translation based on the Saheeh International translation. */
  translation: string;
  /** A broad theme for the verse. */
  theme: 'discipline' | 'focus' | 'hope' | 'gratitude' | 'patience';
};

export const VERSES: DailyVerse[] = [
  {
    id: '3:134',
    surahNumber: 3,
    surahName: 'Ali Imran',
    ayah: 134,
    arabic:
      'ٱلَّذِينَ يُنفِقُونَ فِى ٱلسَّرَّآءِ وَٱلضَّرَّآءِ وَٱلْكَاظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ ۗ وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ',
    transliteration:
      "Allazina yunfiqoona fissarra'i wazzarra'i walkazimeenal ghaiza wal'afeena 'ani n‑naasi wallahu yuhibbul muhsineen",
    translation:
      'They are those who donate in prosperity and adversity, control their anger, and pardon others. And Allah loves the good‑doers.',
    theme: 'discipline',
  },
  {
    id: '5:8',
    surahNumber: 5,
    surahName: 'Al‑Ma\'idah',
    ayah: 8,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُونُوا۟ قَوَّٰمِينَ لِلَّهِ شُهَدَآءَ بِٱلْقِسْطِ ۖ وَلَا يَجْرِمَنَّكُمْ شَنَـَٔانُ قَوْمٍ عَلَىٰٓ أَلَّا تَعْدِلُوا۟ ۚ ٱعْدِلُوا۟ هُوَ أَقْرَبُ لِلتَّقْوَىٰ ۖ وَٱتَّقُوا۟ ٱللَّهَ ۚ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا تَعْمَلُونَ',
    transliteration:
      "Ya ayyuha alladhina amanu kunu qawwamina lillahi shuhada'a bilqist; wa la yajrimannakum shana'anu qawmin ʿala alla taʿdiloo; iʿdiloo huwa aqrabu littaqwa; wattaqullaha innallaha khabirun bima taʿmaloon",
    translation:
      'O believers! Stand firm for Allah and bear true testimony. Do not let the hatred of a people lead you to injustice. Be just! That is closer to righteousness. And be mindful of Allah. Surely Allah is All‑Aware of what you do.',
    theme: 'discipline',
  },
  {
    id: '16:90',
    surahNumber: 16,
    surahName: 'An‑Nahl',
    ayah: 90,
    arabic:
      'إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَانِ وَإِيتَآئِ ذِى ٱلْقُرْبَىٰ وَيَنْهَىٰ عَنِ ٱلْفَحْشَاءِ وَٱلْمُنكَرِ وَٱلْبَغْىِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ',
    transliteration:
      'Inna Allaha ya\'muru bil-ʿadli wal‑ihsan wa ita\'i dhil‑qurba, wa yanha ʿani al‑fahsha\'i wal‑munkar wal‑baghy; yaʿizukum laʿallakum tathakkaroon',
    translation:
      'Indeed, Allah commands justice, grace, as well as generosity to close relatives. He forbids indecency, wickedness, and aggression. He instructs you so perhaps you will be mindful.',
    theme: 'discipline',
  },
  {
    id: '3:102',
    surahNumber: 3,
    surahName: 'Ali Imran',
    ayah: 102,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا ٱتَّقُوا ٱللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُمْ مُسْلِمُونَ',
    transliteration:
      'Ya ayyuha alladhina amanu ittaqoo Allaha haqqa tuqatihi wa la tamutunna illa wa antum muslimoon',
    translation:
      'O believers! Be mindful of Allah in the way He deserves, and do not die except in a state of full submission to Him.',
    theme: 'discipline',
  },
  {
    id: '23:1',
    surahNumber: 23,
    surahName: 'Al‑Mu\'minun',
    ayah: 1,
    arabic: 'قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ',
    transliteration: 'Qad aflaha al‑mu\'minoon',
    translation: 'Successful indeed are the believers.',
    theme: 'focus',
  },
  {
    id: '23:2',
    surahNumber: 23,
    surahName: 'Al‑Mu\'minun',
    ayah: 2,
    arabic: 'ٱلَّذِينَ هُمْ فِى صَلَاتِهِمْ خَـٰشِعُونَ',
    transliteration: 'Alladhina hum fi salatihim khashiʿoon',
    translation: 'those who humble themselves in prayer;',
    theme: 'focus',
  },
  {
    id: '23:9',
    surahNumber: 23,
    surahName: 'Al‑Mu\'minun',
    ayah: 9,
    arabic: 'وَالَّذِينَ هُمْ عَلَىٰ صَلَوَاتِهِمْ يُحَافِظُونَ',
    transliteration: 'Walladhina hum ʿala salawatihim yuhafithoon',
    translation: 'and those who are ˹properly˺ observant of their prayers.',
    theme: 'focus',
  },
  {
    id: '29:45',
    surahNumber: 29,
    surahName: 'Al‑\'Ankabut',
    ayah: 45,
    arabic:
      'ٱتْلُ مَا أُوحِىَ إِلَيْكَ مِنَ ٱلْكِتَابِ وَأَقِمِ ٱلصَّلَاةَ ۖ إِنَّ ٱلصَّلَاةَ تَنْهَىٰ عَنِ ٱلْفَحْشَاءِ وَٱلْمُنكَرِ ۗ وَلَذِكْرُ ٱللَّهِ أَكْبَرُ ۗ وَٱللَّهُ يَعْلَمُ مَا تَصْنَعُونَ',
    transliteration:
      'Utlu ma oohiya ilayka mina al‑kitabi wa aqimis‑salata; inna assalata tanha ʿan al‑fahsha\'i wal‑munkar; wa la dhikrullahi akbar; wallahu yaʿlamu ma tasnaʿoon',
    translation:
      'Recite what has been revealed to you of the Book and establish prayer. Indeed, genuine prayer should deter one from indecency and wickedness. The remembrance of Allah is an even greater deterrent. And Allah fully knows what you all do.',
    theme: 'focus',
  },
  {
    id: '2:183',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 183,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    transliteration:
      'Ya ayyuha alladhina amanu kutiba ʿalaykumu assiyamu kama kutiba ʿala alladhina min qablikum laʿallakum tattaqoon',
    translation:
      'O believers! Fasting is prescribed for you—as it was for those before you—so perhaps you will become mindful of Allah.',
    theme: 'discipline',
  },
  {
    id: '2:219',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 219,
    arabic:
      'يَسْـَٔلُونَكَ عَنِ ٱلْخَمْرِ وَٱلْمَيْسِرِ ۖ قُلْ فِيهِمَا إِثْمٌ كَبِيرٌ وَمَنَافِعُ لِلنَّاسِ وَإِثْمُهُمَا أَكْبَرُ مِن نَّفْعِهِمَا ۗ وَيَسْـَٔلُونَكَ مَاذَا يُنفِقُونَ قُلِ ٱلْعَفْوَ ۗ كَذَٰلِكَ يُبَيِّنُ ٱللَّهُ لَكُمُ ٱلْآيَاتِ لَعَلَّكُمْ تَتَفَكَّرُونَ',
    transliteration:
      "Yas'aloonaka ʿani al‑khamri wal‑maysir; qul fihima ithmun kabirun wa manafiʿu linnasi wa ithmuhuma akbaru min nafʿihima; wa yas'aloonaka matha yunfiqoon; qul al‑ʿafwa; kadhalika yubayyinu Allahu lakumu al‑ayati laʿallakum tatafakkaroon",
    translation:
      'They ask you, O Prophet, about intoxicants and gambling. Say, "There is great evil in both, as well as some benefit for people—but the evil outweighs the benefit." They also ask you, O Prophet, what they should donate. Say, "Whatever you can spare." This is how Allah makes His revelations clear to you believers, so perhaps you may reflect.',
    theme: 'discipline',
  },
  {
    id: '2:188',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 188,
    arabic:
      'وَلَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ وَتُدْلُوا بِهَا إِلَىٰ ٱلْحُكَّامِ لِتَأْكُلُوا فَرِيقًا مِنْ أَمْوَالِ ٱلنَّاسِ بِٱلْإِثْمِ وَأَنتُمْ تَعْلَمُونَ',
    transliteration:
      'Wa la ta\'kuloo amwalakum baynakum bil‑batili wa tudloo biha ila al‑hukkami li takuloo fareeqan min amwali an‑nasi bi‑ithmi wa antum taʿlamoon',
    translation:
      'Do not consume one another\'s wealth unjustly, nor deliberately bribe authorities in order to devour a portion of others\' property, knowing that it is a sin.',
    theme: 'discipline',
  },
  {
    id: '4:135',
    surahNumber: 4,
    surahName: 'An‑Nisa\'',
    ayah: 135,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا كُونُوا قَوَّامِينَ بِٱلْقِسْطِ شُهَدَاءَ لِلَّهِ وَلَوْ عَلَىٰ أَنفُسِكُمْ أَوِ ٱلْوَالِدَيْنِ وَٱلْأَقْرَبِينَ ۚ إِن يَكُنْ غَنِيًّا أَوْ فَقِيرًا فَٱللَّهُ أَوْلَىٰ بِهِمَا ۖ فَلَا تَتَّبِعُوا ٱلْهَوَىٰ أَن تَعْدِلُوا ۚ وَإِن تَلْوُا أَوْ تُعْرِضُوا فَإِنَّ ٱللَّهَ كَانَ بِمَا تَعْمَلُونَ خَبِيرًا',
    transliteration:
      "Ya ayyuha alladhina amanu kunu qawwamina bil‑qisti shuhada'a lillahi walaw ʿala anfusikum awil‑walidayni wal‑aqrabin; in yakun ghaniyyan aw faqiran fa‑Allahu awla bihima; fa la tattabiʿoo al‑hawa an taʿdiloo; wa in talwoo aw tuʿridoo fa‑inna Allaha kana bima taʿmaloon khabeeran",
    translation:
      'O believers! Stand firm for justice as witnesses for Allah even if it is against yourselves, your parents, or close relatives. Be they rich or poor, Allah is best to ensure their interests. So do not let your desires cause you to deviate from justice. If you distort the testimony or refuse to give it, then know that Allah is certainly All‑Aware of what you do.',
    theme: 'discipline',
  },
  {
    id: '17:23',
    surahNumber: 17,
    surahName: 'Al‑Isra\'',
    ayah: 23,
    arabic:
      'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِٱلْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ ٱلْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا',
    transliteration:
      'Wa qada rabbuka alla taʿbudoo illa iyyahu wa bil‑walidayni ihsanan; imma yablughanna ʿindaka al‑kibara ahaduhuma aw kilahuma fala taqul lahuma uffin wa la tanharhuma wa qul lahuma qawlan kareeman',
    translation:
      'For your Lord has decreed that you worship none but Him. And honour your parents. If one or both of them reach old age in your care, never say to them even "ugh," nor yell at them. Rather, address them respectfully.',
    theme: 'discipline',
  },
  {
    id: '17:32',
    surahNumber: 17,
    surahName: 'Al‑Isra\'',
    ayah: 32,
    arabic:
      'وَلَا تَقْرَبُوا الزِّنَى ۖ إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا',
    transliteration:
      'Wa la taqraboo az‑zina; innahu kana fahishatan wa sa\'a sabilan',
    translation:
      'Do not go near adultery. It is truly a shameful deed and an evil way.',
    theme: 'discipline',
  },
  {
    id: '17:35',
    surahNumber: 17,
    surahName: 'Al‑Isra\'',
    ayah: 35,
    arabic:
      'وَأَوْفُوا ٱلْكَيْلَ إِذَا كِلْتُمْ وَزِنُوا بِٱلْقِسْطَاسِ ٱلْمُسْتَقِيمِ ۚ ذَٰلِكَ خَيْرٌ وَأَحْسَنُ تَأْوِيلًا',
    transliteration:
      'Wa awfoo al‑kayla itha kiltum wa zinoo bil‑qistasi al‑mustaqeem; dhalika khayrun wa ahsanu ta\'weelan',
    translation:
      'Give in full when you measure, and weigh with an even balance. That is fairest and best in the end.',
    theme: 'discipline',
  },
  {
    id: '17:36',
    surahNumber: 17,
    surahName: 'Al‑Isra\'',
    ayah: 36,
    arabic:
      'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ ۚ إِنَّ ٱلسَّمْعَ وَٱلْبَصَرَ وَٱلْفُؤَادَ كُلُّ أُو۟لَـٰٓئِكَ كَانَ عَنْهُ مَسْـُٔولًا',
    transliteration:
      'Wa la taqfu ma laysa laka bihi ʿilm; inna assamʿa walbasara walfuada kullu ulaika kana ʿanhu masoolan',
    translation:
      'Do not follow what you have no sure knowledge of. Indeed, all will be called to account for their hearing, sight, and intellect.',
    theme: 'discipline',
  },
  {
    id: '17:37',
    surahNumber: 17,
    surahName: 'Al‑Isra\'',
    ayah: 37,
    arabic:
      'وَلَا تَمْشِ فِي ٱلْأَرْضِ مَرَحًا ۖ إِنَّكَ لَنْ تَخْرِقَ ٱلْأَرْضَ وَلَنْ تَبْلُغَ ٱلْجِبَالَ طُولًا',
    transliteration:
      'Wa la tamshi fil‑ardi marahan; innaka lan takhriqa al‑arda wa lan tablugha al‑jibala toolan',
    translation:
      'And do not walk on the earth arrogantly. Surely you can neither crack the earth nor stretch to the height of the mountains.',
    theme: 'discipline',
  },
  {
    id: '49:11',
    surahNumber: 49,
    surahName: 'Al‑Hujurat',
    ayah: 11,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَنْ يَكُونُوا خَيْرًا مِّنْهُمْ وَلَا نِسَاءٌ مِّن نِّسَاءٍ عَسَىٰ أَنْ يَكُنَّ خَيْرًا مِّنْهُنَّ وَلَا تَلْمِزُوا أَنْفُسَكُمْ وَلَا تَنَابَزُوا بِٱلْأَلْقَابِ ۖ بِئْسَ ٱلِاسْمُ ٱلْفُسُوقُ بَعْدَ ٱلْإِيمَانِ ۚ وَمَنْ لَمْ يَتُبْ فَأُولَٰئِكَ هُمُ ٱلظَّالِمُونَ',
    transliteration:
      "Ya ayyuha alladhina amanu la yaskhar qawmun min qawmin ʿasa an yakoonoo khayran minhum wa la nisa'un min nisa'in ʿasa an yakunna khayran minhunna; wa la talmizu anfusakum wa la tanabazu bil‑alqab; bi'sa al‑ismu al‑fusuqu baʿda al‑iman; wa man lam yatub fa ulaika hum az‑zalimoon",
    translation:
      'O believers! Do not let some men ridicule others, they may be better than them, nor let some women ridicule other women, they may be better than them. Do not defame one another, nor call each other by offensive nicknames. How evil it is to act rebelliously after having faith! And whoever does not repent, it is they who are the true wrongdoers.',
    theme: 'discipline',
  },
  {
    id: '49:12',
    surahNumber: 49,
    surahName: 'Al‑Hujurat',
    ayah: 12,
    arabic:
      'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ ٱلظَّنِّ إِنَّ بَعْضَ ٱلظَّنِّ إِثْمٌ وَلَا تَجَسَّسُوا وَلَا يَغْتَبْ بَعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَنْ يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ ۚ وَاتَّقُوا ٱللَّهَ ۚ إِنَّ ٱللَّهَ تَوَّابٌ رَّحِيمٌ',
    transliteration:
      "Ya ayyuha alladhina amanu ijtaniboo kathiran mina az‑zanni; inna baʿda az‑zanni ithm; wa la tajassasoo wa la yaghtab baʿdukum baʿdan; ayuhibbu ahadukum an ya'kula lahma akhihi maytan fa karihtumoohu; wattaqullaha inna Allaha tawwabun rahim",
    translation:
      'O believers! Avoid many suspicions, for indeed, some suspicions are sinful. And do not spy, nor backbite one another. Would any of you like to eat the flesh of their dead brother? You would despise that! And fear Allah. Surely Allah is the Accepter of Repentance, Most Merciful.',
    theme: 'discipline',
  },
  {
    id: '31:13',
    surahNumber: 31,
    surahName: 'Luqman',
    ayah: 13,
    arabic:
      'وَإِذْ قَالَ لُقْمَانُ لِابْنِهِ وَهُوَ يَعِظُهُ يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ ۖ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ',
    transliteration:
      'Wa idh qala Luqmanu li‑ibnihi wahuwa yaʿizuhu: ya bunayya la tushrik billah; inna ash‑shirka la‑zulmun ʿazim',
    translation:
      'And remember when Luqmān said to his son, while advising him, "O my dear son! Never associate anything with Allah in worship, for associating others with Him is truly the worst of all wrongs."',
    theme: 'discipline',
  },
  {
    id: '31:18',
    surahNumber: 31,
    surahName: 'Luqman',
    ayah: 18,
    arabic:
      'وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّ ٱللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ',
    transliteration:
      'Wa la tusaaʿir khaddaka linnasi wa la tamshi fil‑ardi marahan; inna Allaha la yuhibbu kulla mukhtalin fakhur',
    translation:
      'And do not turn your nose up to people, nor walk pridefully upon the earth. Surely Allah does not like whoever is arrogant, boastful.',
    theme: 'discipline',
  },
  {
    id: '31:19',
    surahNumber: 31,
    surahName: 'Luqman',
    ayah: 19,
    arabic:
      'وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِن صَوْتِكَ ۚ إِنَّ أَنْكَرَ ٱلْأَصْوَاتِ لَصَوْتُ ٱلْحَمِيرِ',
    transliteration:
      'Waqsid fi mashyika waghddud min sawtika; inna ankara al‑aswati la sawtu al‑hamiri',
    translation:
      'Be moderate in your pace. And lower your voice, for the ugliest of all voices is certainly the braying of donkeys.',
    theme: 'discipline',
  },
  {
    id: '7:205',
    surahNumber: 7,
    surahName: 'Al‑A\'raf',
    ayah: 205,
    arabic:
      'وَٱذْكُرْ رَبَّكَ فِي نَفْسِكَ تَضَرُّعًا وَخِيفَةً وَدُونَ ٱلْجَهْرِ مِنَ ٱلْقَوْلِ بِٱلْغُدُوِّ وَٱلْآصَالِ وَلَا تَكُنْ مِنَ ٱلْغَافِلِينَ',
    transliteration:
      'Wadhkur rabbaka fi nafsika tadarruʿan wa khifatan wa doona al‑jahri mina al‑qawli bil‑ghuduwwi wal‑asali wa la takun mina al‑ghafilin',
    translation:
      'Remember your Lord inwardly with humility and reverence and in a moderate tone of voice, both morning and evening. And do not be one of the heedless.',
    theme: 'focus',
  },
  {
    id: '20:14',
    surahNumber: 20,
    surahName: 'Ta‑Ha',
    ayah: 14,
    arabic:
      'إِنَّنِي أَنَا ٱللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَٱعْبُدْنِي وَأَقِمِ ٱلصَّلَاةَ لِذِكْرِي',
    transliteration:
      'Inni ana Allahu la ilaha illa ana; faʿbudni wa aqimi as‑salata li dhikri',
    translation:
      '"It is truly I. I am Allah! There is no god worthy of worship except Me. So worship Me alone, and establish prayer for My remembrance."',
    theme: 'focus',
  },
  {
    id: '73:4',
    surahNumber: 73,
    surahName: 'Al‑Muzzammil',
    ayah: 4,
    arabic: 'أَوْ زِدْ عَلَيْهِ وَرَتِّلِ ٱلْقُرْآنَ تَرْتِيلًا',
    transliteration: 'Aw zid ʿalayhi wa rattlil‑Qur\'ana tartila',
    translation: 'or a little more—and recite the Quran properly in a measured way.',
    theme: 'focus',
  },
  {
    id: '2:238',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 238,
    arabic:
      'حَافِظُوا عَلَى ٱلصَّلَوَاتِ وَٱلصَّلَاةِ ٱلْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ',
    transliteration:
      'Hafizoo ʿala as‑salawati wassalata al‑wusta wa qoomu lillahi qaniteen',
    translation:
      'Observe the five obligatory prayers—especially the middle prayer—and stand in true devotion to Allah.',
    theme: 'focus',
  },
  {
    id: '33:41',
    surahNumber: 33,
    surahName: 'Al‑Ahzab',
    ayah: 41,
    arabic: 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا ٱذْكُرُوا ٱللَّهَ ذِكْرًا كَثِيرًا',
    transliteration: 'Ya ayyuha alladhina amanu uthkuroo Allaha dhikran kathiran',
    translation: 'O believers! Always remember Allah often,',
    theme: 'focus',
  },
  {
    id: '33:42',
    surahNumber: 33,
    surahName: 'Al‑Ahzab',
    ayah: 42,
    arabic: 'وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا',
    transliteration: 'Wa sabbihuhu bukratan wa aseela',
    translation: 'and glorify Him morning and evening.',
    theme: 'focus',
  },
  {
    id: '24:41',
    surahNumber: 24,
    surahName: 'An‑Nur',
    ayah: 41,
    arabic:
      'أَلَمْ تَرَ أَنَّ ٱللَّهَ يُسَبِّحُ لَهُ مَنْ فِي ٱلسَّمَاوَاتِ وَٱلْأَرْضِ وَٱلطَّيْرُ صَافَّاتٍ ۖ كُلٌّ قَدْ عَلِمَ صَلَاتَهُ وَتَسْبِيحَهُ ۗ وَٱللَّهُ عَلِيمٌ بِمَا يَفْعَلُونَ',
    transliteration:
      'Alam tara anna Allaha yusabbihu lahu man fis‑samawati wal‑ardi wal‑tayru saffatin; kullun qad ʿalima salatahu wa tasbihahu; wallahu ʿalimun bima yafʿaloon',
    translation:
      'Do you not see that Allah is glorified by all those in the heavens and the earth, even the birds as they soar? Each instinctively knows their manner of prayer and glorification. And Allah has perfect knowledge of all they do.',
    theme: 'focus',
  },
  {
    id: '3:191',
    surahNumber: 3,
    surahName: 'Ali Imran',
    ayah: 191,
    arabic:
      'ٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ ٱلسَّمَاوَاتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
    transliteration:
      'Alladhina yadhkuroona Allaha qiyaman wa quʿoodan wa ʿala junoobihim wa yatafakkaroon fi khalqi as‑samawati wal‑ardi: Rabbana ma khalaqta hadha batilan; subhanaka; faqina ʿathaba an‑nar',
    translation:
      'They are those who remember Allah while standing, sitting, and lying on their sides, and reflect on the creation of the heavens and the earth and pray, "Our Lord! You have not created all of this without purpose. Glory be to You! Protect us from the torment of the Fire."',
    theme: 'focus',
  },
  {
    id: '16:18',
    surahNumber: 16,
    surahName: 'An‑Nahl',
    ayah: 18,
    arabic:
      'وَإِنْ تَعُدُّوا نِعْمَةَ ٱللَّهِ لَا تُحْصُوهَا ۗ إِنَّ ٱللَّهَ لَغَفُورٌ رَّحِيمٌ',
    transliteration:
      'Wa in taʿuddoo niʿmata Allahi la tahsooha; innallaha la‑ghafurun rahim',
    translation:
      'If you tried to count Allah\'s blessings, you would never be able to number them. Surely Allah is All‑Forgiving, Most Merciful.',
    theme: 'gratitude',
  },
  {
    id: '34:13',
    surahNumber: 34,
    surahName: 'Saba\'',
    ayah: 13,
    arabic:
      'يَعْمَلُونَ لَهُ مَا يَشَاءُ مِن مَّحَارِيبَ وَتَمَاثِيلَ وَجِفَانٍ كَالْجَوَابِ وَقُدُورٍ رَاسِيَاتٍ ۚ ٱعْمَلُوا آلَ دَاوُودَ شُكْرًا ۚ وَقَلِيلٌ مِّنْ عِبَادِيَ ٱلشَّكُورُ',
    transliteration:
      'Yaʿmaluna lahu ma yasha\'u min maharib wa tamathila wa qudoorin jalawiyatin wa qidurin rasiyat; iʿmaloo ala shukri; wa qaleelun min ʿibadiya ash‑shakoor',
    translation:
      'They made for him whatever he desired of sanctuaries, statues, basins as large as reservoirs, and cooking pots fixed into the ground. "Work gratefully, O family of David!" Only a few of My servants are truly grateful.',
    theme: 'gratitude',
  },
  {
    id: '2:186',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 186,
    arabic:
      'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
    transliteration:
      'Wa idha sa\'ala ʿibadi ʿanni fa‑inni qareeb; ujeebu daʿwata ad‑daʿi idha daʿan; falyastajeeboo li walyu\'minoo bi laʿallahum yarshudoon',
    translation:
      'When My servants ask you, O Prophet, about Me: I am truly near. I respond to one\'s prayer when they call upon Me. So let them respond with obedience to Me and believe in Me, perhaps they will be guided to the Right Way.',
    theme: 'hope',
  },
  {
    id: '3:160',
    surahNumber: 3,
    surahName: 'Ali Imran',
    ayah: 160,
    arabic:
      'إِن يَنصُرْكُمُ ٱللَّهُ فَلَا غَالِبَ لَكُمْ ۖ وَإِن يَخْذُلْكُمْ فَمَنْ ذَا ٱلَّذِي يَنصُرُكُم مِّن بَعْدِهِ ۗ وَعَلَى ٱللَّهِ فَلْيَتَوَكَّلِ ٱلْمُؤْمِنُونَ',
    transliteration:
      'In yansurkum Allāhu fala ghaliba lakum; wa in yakhthulkum fa man thalladhi yansurukum min baʿdihi; wa ʿala Allahi falyatawakkalil mu\'minun',
    translation:
      'If Allah helps you, none can defeat you. But if He denies you help, then who else can help you? So in Allah let the believers put their trust.',
    theme: 'hope',
  },
  {
    id: '4:110',
    surahNumber: 4,
    surahName: 'An‑Nisa\'',
    ayah: 110,
    arabic:
      'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ ٱللَّهَ يَجِدِ ٱللَّهَ غَفُورًا رَّحِيمًا',
    transliteration:
      'Wa man yaʿmal su\'an aw yathlim nafsahu thumma yastaghfirillaha yajidillaha ghafuran rahima',
    translation:
      'Whoever commits evil or wrongs themselves then seeks Allah\'s forgiveness will certainly find Allah All‑Forgiving, Most Merciful.',
    theme: 'hope',
  },
  {
    id: '6:17',
    surahNumber: 6,
    surahName: 'Al‑An\'am',
    ayah: 17,
    arabic:
      'وَإِنْ يَمْسَسْكَ ٱللَّهُ بِضُرٍّ فَلَا كَاشِفَ لَهُ إِلَّا هُوَ ۖ وَإِنْ يَمْسَسْكَ بِخَيْرٍ فَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      'Wa in yamsaska Allahu bidurrin fala kashifa lahu illa Huwa; wa in yamsaska bikhayrin fahuwa ʿala kulli shay\'in qadir',
    translation:
      'If Allah touches you with harm, none can undo it except Him. And if He touches you with a blessing, He is Most Capable of everything.',
    theme: 'hope',
  },
  {
    id: '2:249',
    surahNumber: 2,
    surahName: 'Al‑Baqarah',
    ayah: 249,
    arabic:
      'فَلَمَّا فَصَلَ طَالُوتُ بِٱلْجُنُودِ قَالَ إِنَّ ٱللَّهَ مُبْتَلِيكُم بِنَهَرٍ فَمَنْ شَرِبَ مِنْهُ فَلَيْسَ مِنِّي وَمَنْ لَّمْ يَطْعَمْهُ فَإِنَّهُ مِنِّي إِلَّا مَنِ ٱغْتَرَفَ غُرْفَةً بِيَدِهِ ۚ فَشَرِبُوا مِنْهُ إِلَّا قَلِيلًا مِّنْهُمْ ۚ فَلَمَّا جَاوَزَهُ هُوَ وَٱلَّذِينَ آمَنُوا مَعَهُ قَالُوا لَا طَاقَةَ لَنَا ٱلْيَوْمَ بِجَالُوتَ وَجُنُودِهِ ۚ قَالَ ٱلَّذِينَ يَظُنُّونَ أَنَّهُم مُّلَاقُوا ٱللَّهِ كَم مِّن فِئَةٍ قَلِيلَةٍ غَلَبَتْ فِئَةً كَثِيرَةً بِإِذْنِ ٱللَّهِ ۗ وَٱللَّهُ مَعَ ٱلصَّابِرِينَ',
    transliteration:
      'Kam min fi\'atin qaleelatin ghalabat fi\'atan kathiratan bi‑idhnillahi; wallahu maʿa as‑sabireen',
    translation:
      'When Saul marched forth with his army, he cautioned: "Allah will test you with a river. So whoever drinks his fill from it is not with me, and whoever does not taste it—except a sip from the hollow of his hands—is definitely with me." They all drank their fill except for a few! When he and the remaining faithful with him crossed the river, they said, "Now we are no match for Goliath and his warriors." But those believers who were certain they would meet Allah reasoned, "How many times has a small force vanquished a mighty army by the will of Allah! And Allah is always with the steadfast."',
    theme: 'patience',
  },
  {
    id: '41:35',
    surahNumber: 41,
    surahName: 'Fussilat',
    ayah: 35,
    arabic:
      'وَمَا يُلَقَّاهَا إِلَّا ٱلَّذِينَ صَبَرُوا وَمَا يُلَقَّاهَا إِلَّا ذُو حَظٍّ عَظِيمٍ',
    transliteration:
      'Wa ma yulaqqaha illa alladhina sabaroo; wa ma yulaqqaha illa dhu hazzin ʿazim',
    translation:
      'But this cannot be attained except by those who are patient and who are truly fortunate.',
    theme: 'patience',
  },
  {
    id: '47:31',
    surahNumber: 47,
    surahName: 'Muhammad',
    ayah: 31,
    arabic:
      'وَلَنَبْلُوَنَّكُمْ حَتَّىٰ نَعْلَمَ ٱلْمُجَاهِدِينَ مِنْكُمْ وَٱلصَّابِرِينَ وَنَبْلُوَا أَخْبَارَكُمْ',
    transliteration:
      'Wa lanabluwannakum hatta naʿlama al‑mujahideen minkum wa as‑sabireen; wa nabluwa akhbarakum',
    translation:
      'We will certainly test you believers until We prove those of you who truly struggle in Allah\'s cause and remain steadfast, and reveal how you conduct yourselves.',
    theme: 'patience',
  },
  {
    id: '12:18',
    surahNumber: 12,
    surahName: 'Yusuf',
    ayah: 18,
    arabic:
      'وَجَاءُوا عَلَىٰ قَمِيصِهِ بِدَمٍ كَذِبٍ ۚ قَالَ بَلْ سَوَّلَتْ لَكُمْ أَنْفُسُكُمْ أَمْرًا ۖ فَصَبْرٌ جَمِيلٌ ۖ وَٱللَّهُ ٱلْمُسْتَعَانُ عَلَىٰ مَا تَصِفُونَ',
    transliteration:
      'Wa jaʾoo ʿala qamisihi bidamin kadhb; qala bal sawwalat lakum anfusukum amran; fa sabrun jameel; wallahu al‑mustaʿanu ʿala ma tasifoon',
    translation:
      'And they brought his shirt, stained with false blood. He responded, "No! Your souls must have tempted you to do something evil. So I can only endure with beautiful patience! It is Allah\'s help that I seek to bear your claims."',
    theme: 'patience',
  },
  {
    id: '31:14',
    surahNumber: 31,
    surahName: 'Luqman',
    ayah: 14,
    arabic:
      'وَوَصَّيْنَا ٱلْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ ۖ أَنِ ٱشْكُرْ لِي وَلِوَالِدَيْكَ ۖ إِلَيَّ ٱلْمَصِيرُ',
    transliteration:
      'Wa wassayna al‑insana bi walidayhi; hamalathu ummuhu wahnan ʿala wahn; wa fisluhu fi ʿamayni; anishkur li wa liwalidayka ilayya al‑masir',
    translation:
      'And We have commanded people to honour their parents. Their mothers bore them through hardship upon hardship, and their weaning takes two years. So be grateful to Me and your parents. To Me is the final return.',
    theme: 'gratitude',
  },
  {
    id: '1:1',
    surahNumber: 1,
    surahName: 'Al‑Fatiha',
    ayah: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
    transliteration: 'Bismillahir Rahmanir Raheem',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
    theme: 'gratitude',
  },
];

